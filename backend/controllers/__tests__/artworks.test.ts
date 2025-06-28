import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import ArtworksRouter from "../../routes/artwork";
import { constructAdvSearchFilter, constructQuickSearchFilter } from "../../utils/artworks";
import Artwork from "../../models/artwork";

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
const mockSaveArtwork = jest.fn()

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

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"
const collectionId = "66f2194a6123d7f50558cd8f"
const collectionName = "collection"
const artworkId = "66ce0bf156199c1b8df5db7d"

const startSessionDefaultReturnValue = Promise.resolve({
    withTransaction: (async (transactionFunc: Function) => {
        await transactionFunc()
    }),
    endSession: jest.fn()      
})

const filesToUpload = [
    {
        fieldname: "file[]",
        originalname: "MIDI_sample.mid",
        encoding: "7bit",
        buffer: Buffer.from("File 1 content"),
        mimetype: "audio/midi",
        size: 1000,
    },
    {
        fieldname: "file[]",
        originalname: "MIDI_sample2.mid",
        encoding: "7bit",
        buffer: Buffer.from("File 2 content"),
        mimetype: "audio/midi",
        size: 1000,
    }
]

describe('artworks controller', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        app.use(ArtworksRouter)
    })

    describe('GET endpoints', () => {
        test("getArtwork should respond with status 200 and correct body", async () => {
            mockIsValidObjectId.mockReturnValue(true)
            mockFindById.mockReturnValue({
                exec: jest.fn().mockReturnValue(Promise.resolve({
                    _id: `${artworkId}`,
                    categories: [{name: 'Title', value: "Title", subcategories: []}],
                    collectionName: collectionName,
                    createdAt: new Date("2024-09-10T12:17:12.821Z"),
                    updatedAt: new Date("2024-09-10T12:17:12.821Z"),
                    __v: 0
                }))
            })

            const res = await request(app)
                .get(`/${artworkId}`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                isValidObjectId: false, findById: undefined, artworkId: '123',
                statusCode: 400, error: 'Invalid artwork id'
            },
            {
                isValidObjectId: true,
                findById: {exec: () => Promise.resolve(null)},
                artworkId: 'aaaaaaaad628570afa5357c3',
                statusCode: 404,
                error: "Artwork not found"
            },
            {
                isValidObjectId: true, findById: {exec: () => {throw Error()}}, artworkId: 'aaaaaaaad628570afa5357c3',
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
                artworkFind: () => {return {sort: () => ({exec: () => Promise.resolve([
                    {
                      _id: artworkId,
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          value: 'testowy',
                          subcategories: []
                        },
                      ],
                      collectionName: collectionName
                    },
                ])})}},
                sortRecordsByCategory: () => [
                    {
                      _id: artworkId,
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          value: 'testowy',
                          subcategories: []
                        },
                      ],
                      collectionName: collectionName
                    },
                ],
                statusCode: 200
            },
            {
                case: "quicksearch",
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                search: "search=true&", searchText: "searchText=Testowy&",
                quickSearchCalls: 1, advSearchCalls: 0,
                artworkFind: () => {return {sort: () => ({exec: () => Promise.resolve([
                    {
                      _id: artworkId,
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          value: 'testowy',
                          subcategories: []
                        },
                      ],
                      collectionName: collectionName
                    },
                ])})}},
                sortRecordsByCategory: () => [
                    {
                      _id: artworkId,
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          value: 'testowy',
                          subcategories: []
                        },
                      ],
                      collectionName: collectionName
                    },
                ],
                statusCode: 200
            },
            {
                case: "advanced search",
                page: "page=1&", pageSize: "pageSize=10&", sortBy: "sortBy=Tytuł&", sortOrder: "sortOrder=asc&",
                collectionIds: [collectionId],
                search: "search=true&", searchText: undefined,
                quickSearchCalls: 0, advSearchCalls: 1,
                artworkFind: () => {return {sort: () => ({exec: () => Promise.resolve([
                    {
                      _id: artworkId,
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          value: 'testowy',
                          subcategories: []
                        },
                      ],
                      collectionName: collectionName
                    },
                ])})}},
                sortRecordsByCategory: () => [
                    {
                      _id: artworkId,
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          value: 'testowy',
                          subcategories: []
                        },
                      ],
                      collectionName: collectionName
                    },
                ],
                statusCode: 200
            },
        ])(`getArtworksForPage should respond with status 200 and correct body - $case`,
            async ({page, pageSize, sortBy, sortOrder, collectionIds, search, searchText, quickSearchCalls, advSearchCalls, artworkFind, sortRecordsByCategory, statusCode}) => {
                mockCollectionFind.mockReturnValue({exec: () => ([{
                    _id: collectionId,
                    name: collectionName,
                    description: 'collection description',
                    categories: [
                        {name: 'Tytuł', subcategories: []}
                    ],
                    __v: 0
                }])}     
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
                collectionFind: () => ({exec: () => ([{
                    _id: collectionId,
                    name: collectionName,
                    description: 'collection description',
                    categories: [
                        {name: 'Tytuł', subcategories: []}
                    ],
                    __v: 0
                }])}),
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
            mockArtworkFind.mockReturnValue({limit: () => ({
                exec: () => ([
                    {
                        "_id":"680d3aaa071644252a168caa",
                        "collectionName":"collection",
                        "categories":[{"name":"Tytuł","value":"Searched Text","subcategories":[]}],
                        "createdAt":"2025-04-26T19:57:30.007Z",
                        "updatedAt":"2025-04-26T19:57:30.007Z",
                        "__v":0
                    }
                ])
            })})

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
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                searchText: "Searched text",
                numOfArtworks: undefined,
                artworkFind: () => {throw Error()},
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
            (Artwork as unknown as jest.Mock).mockImplementation(() => ({
                __v: 0,
                _id: "66ce0bf156199c1b8df5db7d",
                categories: [
                    {
                    "name": "Title",
                    "subcategories": [],
                    "value": "Title",
                    },
                ],
                collectionName: "collection",
                createdAt: "2024-08-27T17:25:05.352Z",
                updatedAt: "2024-08-27T17:25:05.352Z",
                save: () => mockSaveArtwork()
            }));
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFindOne.mockReturnValue({
                exec: () => Promise.resolve({
                    _id: collectionId,
                    name: collectionName,
                    description: 'collection description',
                    categories: [
                        {name: 'Title', subcategories: []}
                    ],
                    __v: 0
                })
            })
            mockArtworkCategoriesHaveValidFormat.mockReturnValue(true)
            const payload = {
                categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                collectionName: collectionName
            }
            mockHandleFileUpload.mockReturnValue({
                "artwork": {
                    "__v": 0,
                    "_id": "66ce0bf156199c1b8df5db7d",
                    "categories": [
                    {
                        "name": "Title",
                        "subcategories": [],
                        "value": "Title",
                    },
                    ],
                    "collectionName": "collection",
                    "createdAt": "2024-08-27T17:25:05.352Z",
                    "updatedAt": "2024-08-27T17:25:05.352Z",
                },
                "savedFilesCount": 0,
                "failedUploadsCount": 0,
                "failedUploadsFilenames": [],
            })

            const res = await request(app)
                .post('/create')
                .send(payload)
                .set('Authorization', `Bearer ${jwtToken}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                payload: {},
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {categories: '[{"name": "Title", "value": "Title", "subcategories": []}]'},
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {collectionName: collectionName},
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: 'unparsable categories data',
                    collectionName: collectionName
                },
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionName: collectionName
                },
                startSession: () => {throw Error()},
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 503, error: 'Database unavailable'
            },  
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionName: collectionName
                },
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => {throw Error()}}, artworkCategoriesHaveValidFormat: true,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionName: collectionName
                },
                startSession: () => startSessionDefaultReturnValue,
                findOne: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionName: collectionName
                },
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve({
                    _id: `${collectionId}`,
                    name: collectionName,
                    description: 'collection description',
                    categories: [
                        {name: 'Title', subcategories: []}
                    ],
                    __v: 0
                })},
                artworkCategoriesHaveValidFormat: false,
                statusCode: 400,
                error: "Incorrect request body provided"
            },
            {
                payload: {
                    categories: '[{"name": "Title", "value": "Title", "subcategories": []}]',
                    collectionName: collectionName
                },
                startSession: () => startSessionDefaultReturnValue,
                findOne: {exec: () => Promise.resolve(null)},
                artworkCategoriesHaveValidFormat: true,
                statusCode: 404,
                error: "Collection not found"
            }
        ])(`createArtwork should respond with status $statusCode and correct error message`,
            async ({
                       payload,
                       startSession,
                       findOne,
                       artworkCategoriesHaveValidFormat,
                       statusCode,
                       error
                   }) => {
                mockStartSession.mockImplementation(startSession)
                mockCollectionFindOne.mockReturnValue(findOne)
                mockArtworkCategoriesHaveValidFormat.mockReturnValue(artworkCategoriesHaveValidFormat)

                const res = await request(app)
                    .post('/create')
                    .send(payload)
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')

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