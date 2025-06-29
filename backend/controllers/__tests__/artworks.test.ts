import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import ArtworksRouter from "../../routes/artwork";
import { constructAdvSearchFilter, constructQuickSearchFilter, handleFileUpload } from "../../utils/artworks";
import Artwork from "../../models/artwork";
import { jwtToken, collectionId, collectionName, artworkId, startSessionDefaultReturnValue, getArtworkFindByIdReturnValue, getArtworksForPageFindReturnValue, getArtworksForPageRecords, oneCollectionData, getArtworksBySearchTextMatchedInTopmostCategoryArtworkFindReturnValue, createArtworkConstructorReturnValue, createArtworkHappyPathHandleFileUploadsReturnValue, createArtworkConstructorReturnValueWithSaveError } from "./utils/consts";
import path from "path";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockIsValidObjectId = jest.fn()
const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
    isValidObjectId: () => mockIsValidObjectId(),
    startSession: () => mockStartSession()
}))

const mockSortRecordsByCategory = jest.fn() 
const mockHandleFileUpload = jest.fn()
jest.mock('../../utils/artworks', () => ({
    constructQuickSearchFilter: jest.fn(),
    constructAdvSearchFilter: jest.fn(),
    constructTopmostCategorySearchTextFilter: jest.fn(),
    sortRecordsByCategory: () => mockSortRecordsByCategory(),
    handleFileUpload: () => mockHandleFileUpload()
}))

const mockArtworkCategoriesHaveValidFormat = jest.fn() 
jest.mock('../../utils/categories', () => ({
    artworkCategoriesHaveValidFormat: () => mockArtworkCategoriesHaveValidFormat()
}))

const mockFindById = jest.fn()
const mockArtworkFind = jest.fn()
const mockReplaceOne = jest.fn()
const mockCountDocuments = jest.fn()
const mockDeleteMany = jest.fn()

jest.mock("../../models/artwork", () => {
    const mockConstructor: any = jest.fn();
    mockConstructor.findById = jest.fn(() => mockFindById());
    mockConstructor.find = jest.fn(() => mockArtworkFind());
    mockConstructor.replaceOne = jest.fn(() => mockReplaceOne());
    mockConstructor.countDocuments = jest.fn(() => mockCountDocuments());
    mockConstructor.deleteMany = jest.fn(() => mockDeleteMany());
    return {
        __esModule: true,
        default: mockConstructor
    };
});

const mockCollectionFind = jest.fn()
const mockCollectionFindOne = jest.fn()
jest.mock("../../models/collection", () => ({
    find: () => mockCollectionFind(),
    findOne: () => mockCollectionFindOne()
}))

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn()
}))

describe('artworks controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        app.use(ArtworksRouter)
    })

    describe('GET endpoints', () => {
        test("getArtwork should respond with status 200 and correct body", async () => {
            mockIsValidObjectId.mockReturnValue(true)
            mockFindById.mockReturnValue(getArtworkFindByIdReturnValue)

            const res = await request(app)
                .get(`/${artworkId}`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                isValidObjectId: false, findById: undefined, artworkId: artworkId,
                statusCode: 400, error: 'Invalid artwork id'
            },
            {
                isValidObjectId: true,
                findById: {exec: () => Promise.resolve(null)},
                artworkId: artworkId,
                statusCode: 404,
                error: "Artwork not found"
            },
            {
                isValidObjectId: true, findById: {exec: () => {throw Error()}}, artworkId: artworkId,
                statusCode: 503, error: "Database unavailable"
            },
        ])(`getArtwork should respond with status $statusCode and correct error message`,
            async ({isValidObjectId, findById, artworkId, statusCode, error}) => {
                mockIsValidObjectId.mockReturnValue(isValidObjectId)
                mockFindById.mockReturnValue(findById)

                const res = await request(app)
                    .get(`/${artworkId}`)
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )

        test.each([
            {
                case: "no filtering",
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                search: "search=false&", searchText: undefined,
                quickSearchCalls: 0, advSearchCalls: 0,
                artworkFind: () => getArtworksForPageFindReturnValue,
                sortRecordsByCategory: () => getArtworksForPageRecords,
                statusCode: 200
            },
            {
                case: "quicksearch",
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                search: "search=true&", searchText: "searchText=Testowy&",
                quickSearchCalls: 1, advSearchCalls: 0,
                artworkFind: () => getArtworksForPageFindReturnValue,
                sortRecordsByCategory: () => getArtworksForPageRecords,
                statusCode: 200
            },
            {
                case: "advanced search",
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                search: "search=true&", searchText: undefined,
                quickSearchCalls: 0, advSearchCalls: 1,
                artworkFind: () => getArtworksForPageFindReturnValue,
                sortRecordsByCategory: () => getArtworksForPageRecords,
                statusCode: 200
            },
        ])(`getArtworksForPage should respond with status 200 and correct body - $case`,
            async ({page, pageSize, sortBy, sortOrder, collectionIds, search, searchText, quickSearchCalls, advSearchCalls, artworkFind, sortRecordsByCategory, statusCode}) => {
                mockCollectionFind.mockReturnValue({exec: () => ([oneCollectionData])}     
                )
                mockArtworkFind.mockImplementation(artworkFind)
                mockSortRecordsByCategory.mockImplementation(sortRecordsByCategory)

                let queryString = `/?`
                if (page) queryString += page
                if (pageSize) queryString += pageSize
                if (search) queryString += search
                if (searchText) queryString += searchText
                if (sortBy) queryString += sortBy
                if (sortOrder) queryString += sortOrder
                if (collectionIds) {
                    for(const id of collectionIds) {
                        queryString += `collectionIds=${id}&`
                    }
                }

                const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(constructQuickSearchFilter).toHaveBeenCalledTimes(quickSearchCalls)
                expect(constructAdvSearchFilter).toHaveBeenCalledTimes(advSearchCalls)
                expect(res.body).toMatchSnapshot()
            }
        )

        test.each([
            {
                page: undefined, pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                collectionFind: () => {throw Error()},
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: undefined, sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                collectionFind: () => {throw Error()},
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortBy: undefined, sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                collectionFind: () => {throw Error()},
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: undefined,
                collectionIds: [collectionId],
                collectionFind: () => {throw Error()},
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [],
                collectionFind: () => {throw Error()},
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                collectionFind: () => {return {exec: () => Promise.resolve([])}},
                artworkFind: () => {throw Error()},
                statusCode: 404, error: 'Collection not found'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                collectionFind: () => {throw Error()},
                artworkFind: () => {},
                statusCode: 503, error: 'Database unavailable'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                collectionFind: () => ({exec: () => ([oneCollectionData])}),
                artworkFind: () => {throw Error()},
                statusCode: 503, error: 'Database unavailable'
            },
        ])(`getArtworksForPage should respond with status $statusCode and correct error message`,
            async ({page, pageSize, sortBy, sortOrder, collectionIds, collectionFind, artworkFind, statusCode, error}) => {
                mockCollectionFind.mockImplementation(collectionFind)
                mockArtworkFind.mockImplementation(artworkFind)

                let queryString = `/?`
                if (page) queryString += page
                if (pageSize) queryString += pageSize
                if (sortBy) queryString += sortBy
                if (sortOrder) queryString += sortOrder
                if (collectionIds) {
                    for(const id of collectionIds) {
                        queryString += `collectionIds=${id}&`
                    }
                }
                
                const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )

        test("getArtworksBySearchTextMatchedInTopmostCategory should respond with status 200 and correct body", async () => {
            mockArtworkFind.mockReturnValue(getArtworksBySearchTextMatchedInTopmostCategoryArtworkFindReturnValue)

            const res = await request(app)
                .get(`/omram/search?searchText=Searched Text&n=1`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                searchText: undefined,
                numOfArtworks: 1,
                artworkFind: () => getArtworksBySearchTextMatchedInTopmostCategoryArtworkFindReturnValue,
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                searchText: "Searched text",
                numOfArtworks: undefined,
                artworkFind: () => getArtworksBySearchTextMatchedInTopmostCategoryArtworkFindReturnValue,
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                searchText: "Searched text",
                numOfArtworks: 1,
                artworkFind: () => {throw Error()},
                statusCode: 503, error: 'Database unavailable'
            },
        ])(`getArtworksBySearchTextMatchedInTopmostCategory should respond with status $statusCode and correct error message`,
            async ({searchText, numOfArtworks, artworkFind, statusCode, error}) => {
                mockArtworkFind.mockImplementation(artworkFind)
                
                let queryString = `/omram/search?`
                if (searchText) queryString += `searchText=${searchText}&`
                if (numOfArtworks) queryString += `n=${numOfArtworks}&`

                const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )
    })

    describe('POST endpoints', () => {
        test("createArtwork should respond with status 201 and correct body", async () => {
            (Artwork as unknown as jest.Mock).mockImplementation(() => createArtworkConstructorReturnValue);
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFindOne.mockReturnValue({
                exec: () => Promise.resolve(oneCollectionData)
            })
            mockArtworkCategoriesHaveValidFormat.mockReturnValue(true)
            const payload = {
                categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                collectionId: collectionId
            }
            mockHandleFileUpload.mockReturnValue(createArtworkHappyPathHandleFileUploadsReturnValue)

            const res = await request(app)
                .post('/create')
                .field('collectionId', payload.collectionId)
                .field('categories', payload.categories)
                .set('Authorization', `Bearer ${jwtToken}`)
                .attach("files", path.resolve(__dirname, 'utils/files-for-upload/FileForUpload.mid'))
                .attach("files", path.resolve(__dirname, 'utils/files-for-upload/FileForUpload2.mid'))
                .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                payload: {},
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {categories: '[{"name": "Title", "value": "Title", "subcategories": []}]'},
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {collectionId: collectionId},
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: 'unparsable categories data',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: ["FileForUpload.mid", "FileForUpload.mid"],
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [
                    "FileForUpload.mid", "FileForUpload2.mid", "FileForUpload3.mid",
                    "FileForUpload4.mid", "FileForUpload5.mid", "FileForUpload6.mid"
                ],
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => {throw Error()},
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 503, error: 'Database unavailable'
            },  
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => {throw Error()}}, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve(oneCollectionData)}, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => {throw Error()},
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve(oneCollectionData)}, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValueWithSaveError,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve(oneCollectionData)},
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                artworkCategoriesHaveValidFormat: false,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 400,
                error: "Incorrect request body provided"
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve(null)},
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                artworkCategoriesHaveValidFormat: true,
                handleFileUpload: () => createArtworkHappyPathHandleFileUploadsReturnValue,
                statusCode: 404,
                error: "Collection not found"
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionId: collectionId
                },
                filesForUpload: [],
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve(oneCollectionData)}, artworkCategoriesHaveValidFormat: true,
                artworkContructorImplementation: () => createArtworkConstructorReturnValue,
                handleFileUpload: () => {throw Error('Internal server error')},
                statusCode: 500, error: 'Internal server error'
            },
        ])(`createArtwork should respond with status $statusCode and correct error message`,
            async ({
                       payload,
                       filesForUpload,
                       startSession,
                       findOne,
                       artworkContructorImplementation,
                       artworkCategoriesHaveValidFormat,
                       handleFileUpload,
                       statusCode,
                       error
                   }) => {
                (Artwork as unknown as jest.Mock).mockImplementation(artworkContructorImplementation);
                mockStartSession.mockImplementation(startSession)
                mockCollectionFindOne.mockReturnValue(findOne)
                mockArtworkCategoriesHaveValidFormat.mockReturnValue(artworkCategoriesHaveValidFormat)
                mockHandleFileUpload.mockImplementation(handleFileUpload)
                
                let req = request(app)
                    .post('/create')
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .set('Accept', 'application/json')
                if(payload.collectionId)
                    req = req.field("collectionId", payload.collectionId)
                if(payload.categories)
                    req = req.field("categories", payload.categories)
                for(const filename of filesForUpload)
                    req = req.attach("files", path.resolve(__dirname, `utils/files-for-upload/${filename}`))

                const res = await req

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )
    })

    // describe('PUT endpoints', () => {
    //     test("editArtwork should respond with status 201 and correct body", async () => {
    //         mockReplaceOne.mockReturnValue({
    //             exec: () => Promise.resolve({
    //                 acknowledged: true,
    //                 modifiedCount: 1,
    //                 upsertedId: null,
    //                 upsertedCount: 0,
    //                 matchedCount: 1
    //             })
    //         })
    //         const payload = {
    //             categories: [{name: 'Title', value: 'New Title', subcategories: []}],
    //             collectionName: collectionName
    //         }

    //         const res = await request(app)
    //             .put(`/edit/${artworkId}`)
    //             .send(payload)
    //             .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
    //             .set('Content-Type', 'application/json')
    //             .set('Accept', 'application/json')

    //         expect(res.status).toBe(201)
    //         expect(res.body).toMatchSnapshot()
    //     })

    //     const replaceOneNoMatchResponse = {
    //         exec: () => Promise.resolve({
    //             acknowledged: true,
    //             modifiedCount: 0,
    //             upsertedId: null,
    //             upsertedCount: 0,
    //             matchedCount: 0
    //         })
    //     }

    //     test.each([
    //         {
    //             payload: {},
    //             replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'
    //         },
    //         {
    //             payload: {categories: [{name: 'Title', value: 'New Title', subcategories: []}]},
    //             replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'
    //         },
    //         {
    //             payload: {collectionName: collectionName},
    //             replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'
    //         },
    //         {
    //             payload: {
    //                 categories: [{name: 'Title', value: 'New Title', subcategories: []}],
    //                 collectionName: collectionName
    //             },
    //             replaceOne: {exec: () => {throw Error()}}, statusCode: 503, error: 'Database unavailable'
    //         },
    //         {
    //             payload: {
    //                 categories: [{name: 'Title', value: 'New Title', subcategories: []}],
    //                 collectionName: collectionName
    //             },
    //             replaceOne: replaceOneNoMatchResponse, statusCode: 404, error: 'Artwork not found'
    //         }
    //     ])(`editArtwork should respond with status $statusCode and correct error message`,
    //         async ({
    //                    payload,
    //                    replaceOne,
    //                    statusCode,
    //                    error
    //                }) => {
    //             mockReplaceOne.mockReturnValue(replaceOne)

    //             const res = await request(app)
    //                 .put(`/edit/${artworkId}`)
    //                 .send(payload)
    //                 .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
    //                 .set('Content-Type', 'application/json')
    //                 .set('Accept', 'application/json')

    //             expect(res.status).toBe(statusCode)
    //             expect(res.body.error).toBe(error)
    //         }
    //     )
    // })

    // describe('DELETE endpoints', () => {
        

    //     test("deleteArtworks should respond with status 200 and correct body", async () => {
    //         mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
    //         mockCountDocuments.mockReturnValue({
    //             exec: () => Promise.resolve(2)
    //         })
    //         mockDeleteMany.mockReturnValue({
    //             exec: () => Promise.resolve({acknowledged: true, deletedCount: 2})
    //         })
    //         const payload = {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']}

    //         const res = await request(app)
    //             .delete('/delete')
    //             .send(payload)
    //             .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
    //             .set('Content-Type', 'application/json')
    //             .set('Accept', 'application/json')

    //         expect(res.status).toBe(200)
    //         expect(res.body).toMatchSnapshot()
    //     })

    //     test.each([
    //         {
    //             payload: {},
    //             startSession: () => startSessionDefaultReturnValue,
    //             countDocuments: undefined, deleteMany: undefined,
    //             statusCode: 400, error: 'Incorrect request body provided'
    //         },
    //         {
    //             payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
    //             startSession: () => {throw Error()},
    //             countDocuments: undefined, deleteMany: undefined,
    //             statusCode: 503, error: `Database unavailable`
    //         },
    //         {
    //             payload: {ids: []},
    //             startSession: () => startSessionDefaultReturnValue,
    //             countDocuments: undefined, deleteMany: undefined,
    //             statusCode: 400, error: "Artworks not specified"
    //         },
    //         {
    //             payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
    //             startSession: () => startSessionDefaultReturnValue,
    //             countDocuments: {exec: () => {throw Error()}}, deleteMany: undefined,
    //             statusCode: 503, error: "Database unavailable"
    //         },
    //         {
    //             payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
    //             startSession: () => startSessionDefaultReturnValue,
    //             countDocuments: {exec: () => Promise.resolve(2)}, deleteMany: {exec: () => {throw Error()}},
    //             statusCode: 503, error: "Database unavailable"
    //         },
    //         {
    //             payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
    //             startSession: () => startSessionDefaultReturnValue,
    //             countDocuments: {exec: () => Promise.resolve(1)}, deleteMany: undefined,
    //             statusCode: 404, error: "Artworks not found"
    //         },
    //     ])(`deleteArtworks should respond with status $statusCode and correct error message`,
    //         async ({payload, startSession, countDocuments, deleteMany, statusCode, error}) => {
    //             mockStartSession.mockImplementation(startSession)       
    //             mockCountDocuments.mockReturnValue(countDocuments)
    //             mockDeleteMany.mockReturnValue(deleteMany)

    //             const res = await request(app)
    //                 .delete('/delete')
    //                 .send(payload)
    //                 .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
    //                 .set('Content-Type', 'application/json')
    //                 .set('Accept', 'application/json')

    //             expect(res.status).toBe(statusCode)
    //             expect(res.body.error).toBe(error)
    //         }
    //     )
    // })
})