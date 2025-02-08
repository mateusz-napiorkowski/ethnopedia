import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import ArtworksRouter from "../../routes/artwork";
import { constructAdvSearchFilter, constructQuickSearchFilter, sortRecordsByCategory } from "../../utils/artworks";

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
jest.mock('../../utils/artworks', () => ({
    constructQuickSearchFilter: jest.fn(),
    constructAdvSearchFilter: jest.fn(),
    sortRecordsByCategory: () => mockSortRecordsByCategory()
}))

const mockArtworkCategoriesHaveValidFormat = jest.fn() 
jest.mock('../../utils/categories', () => ({
    artworkCategoriesHaveValidFormat: () => mockArtworkCategoriesHaveValidFormat()
}))

const mockFindById = jest.fn()
const mockArtworkFind = jest.fn()
const mockCreate = jest.fn()
const mockReplaceOne = jest.fn()
const mockCountDocuments = jest.fn()
const mockDeleteMany = jest.fn()

jest.mock("../../models/artwork", () => ({
    findById: () => mockFindById(),
    find: () => mockArtworkFind(),
    create: () => mockCreate(),
    replaceOne: () => mockReplaceOne(),
    countDocuments: () => mockCountDocuments(),
    deleteMany: () => mockDeleteMany()
}))

const mockFind = jest.fn()
jest.mock("../../models/collection", () => ({
    find: () => mockFind()
}))

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn()
}))

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

describe('artworks controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(ArtworksRouter)
    })

    describe('GET endpoints', () => {
        test("getArtwork should respond with status 200 and correct body", async () => {
            const artworkId = "662e92b5d628570afa5357c3"
            mockIsValidObjectId.mockReturnValue(true)
            mockFindById.mockReturnValue({
                exec: jest.fn().mockReturnValue(Promise.resolve({
                    _id: `${artworkId}`,
                    categories: [{name: 'Title', values: ["Title"], subcategories: []}],
                    collectionName: 'collection',
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
                page: "page=1&", pageSize: "pageSize=10&", sortOrder: "Tytuł-asc",
                search: "search=false&", searchText: undefined,
                quickSearchCalls: 0, advSearchCalls: 0,
                artworkFind: () => {return {exec: () => Promise.resolve([
                    {
                      _id: "6717d4c0666e8575d873ee69",
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          values: [ 'testowy' ],
                          subcategories: []
                        },
                      ],
                      collectionName: 'collection'
                    },
                ])}},
                sortRecordsByCategory: () => [
                    {
                      _id: "6717d4c0666e8575d873ee69",
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          values: [ 'testowy' ],
                          subcategories: []
                        },
                      ],
                      collectionName: 'collection'
                    },
                ],
                statusCode: 200
            },
            {
                case: "quicksearch",
                page: "page=1&", pageSize: "pageSize=10&", sortOrder: "Tytuł-asc",
                search: "search=true&", searchText: "searchText=Testowy&",
                quickSearchCalls: 1, advSearchCalls: 0,
                artworkFind: () => {return {exec: () => Promise.resolve([
                    {
                      _id: "6717d4c0666e8575d873ee69",
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          values: [ 'testowy' ],
                          subcategories: []
                        },
                      ],
                      collectionName: 'collection'
                    },
                ])}},
                sortRecordsByCategory: () => [
                    {
                      _id: "6717d4c0666e8575d873ee69",
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          values: [ 'testowy' ],
                          subcategories: []
                        },
                      ],
                      collectionName: 'collection'
                    },
                ],
                statusCode: 200
            },
            {
                case: "advanced search",
                page: "page=1&", pageSize: "pageSize=10&", sortOrder: "Tytuł-asc",
                search: "search=true&", searchText: undefined,
                quickSearchCalls: 0, advSearchCalls: 1,
                artworkFind: () => {return {exec: () => Promise.resolve([
                    {
                      _id: "6717d4c0666e8575d873ee69",
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          values: [ 'testowy' ],
                          subcategories: []
                        },
                      ],
                      collectionName: 'collection'
                    },
                ])}},
                sortRecordsByCategory: () => [
                    {
                      _id: "6717d4c0666e8575d873ee69",
                      createdAt: '2024-10-22T20:12:12.209Z',
                      updatedAt: '2024-10-22T20:12:12.209Z',
                      __v: 0,
                      categories: [
                        {
                          name: 'Tytuł',
                          values: [ 'testowy' ],
                          subcategories: []
                        },
                      ],
                      collectionName: 'collection'
                    },
                ],
                statusCode: 200
            },
        ])(`getArtworksForCollectionPage should respond with status 200 and correct body - $case`,
            async ({page, pageSize, sortOrder, search, searchText, quickSearchCalls, advSearchCalls, artworkFind, sortRecordsByCategory, statusCode}) => {
                mockArtworkFind.mockImplementation(artworkFind)
                mockSortRecordsByCategory.mockImplementation(sortRecordsByCategory)

                let queryString = `/collection/artworks/${sortOrder}?`
                if (page) queryString += page
                if (pageSize) queryString += pageSize
                if (search) queryString += search
                if (searchText) queryString += searchText

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
                page: undefined, pageSize: "pageSize=10&", sortOrder: "Tytuł-asc",
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: undefined, sortOrder: "Tytuł-asc",
                artworkFind: () => {throw Error()},
                statusCode: 400, error: 'Request is missing query params'
            },
            {
                page: "page=1&", pageSize: "pageSize=10&", sortOrder: "Tytuł-asc",
                artworkFind: () => {throw Error()},
                statusCode: 503, error: 'Database unavailable'
            },
        ])(`getArtworksForCollectionPage should respond with status $statusCode and correct error message`,
            async ({page, pageSize, sortOrder, artworkFind, statusCode, error}) => {
                mockArtworkFind.mockImplementation(artworkFind)

                let queryString = `/collection/artworks/${sortOrder}?`
                if (page) queryString += page
                if (pageSize) queryString += pageSize

                const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )
    })

    describe('POST endpoints', () => {
        const artworkId = "66ce0bf156199c1b8df5db7d"
        const collectionId = "66c4e516d6303ed5ac5a8e55"
        test("createArtwork should respond with status 201 and correct body", async () => {
            mockCreate.mockReturnValue(Promise.resolve({
                _id: `${artworkId}`,
                categories: [{name: 'Title', values: ['Title'], subcategories: []}],
                collectionName: 'collection',
                createdAt: '2024-08-27T17:25:05.352Z',
                updatedAt: '2024-08-27T17:25:05.352Z',
                __v: 0
            }))
            mockFind.mockReturnValue({
                exec: () => Promise.resolve([{
                    _id: `${collectionId}`,
                    name: 'collection',
                    description: 'collection description',
                    categories: [
                        {name: 'Title', subcategories: []}
                    ],
                    __v: 0
                }])
            })
            mockArtworkCategoriesHaveValidFormat.mockReturnValue(true)
            const payload = {
                categories: [{name: 'Title', values: ['Title'], subcategories: []}],
                collectionName: 'collection'
            }

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
                create: undefined, find: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {categories: [{name: 'Title', values: ['Title'], subcategories: []}]},
                create: undefined, find: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {collectionName: 'collection'},
                create: undefined, find: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 400, error: 'Incorrect request body provided'
            },  
            {
                payload: {
                    categories: [{name: 'Title', values: ['Title'], subcategories: []}],
                    collectionName: 'collection'
                },
                create: undefined, find: {exec: () => {throw Error()}}, artworkCategoriesHaveValidFormat: true,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: [{name: 'Title', values: ['Title'], subcategories: []}],
                    collectionName: 'collection'
                },
                create: () => Promise.reject(), find: undefined, artworkCategoriesHaveValidFormat: true,
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: [{name: 'Title', values: ['Title'], subcategories: []}],
                    collectionName: 'collection'
                },
                create: undefined,
                find: {exec: () => Promise.resolve([{
                    _id: `${collectionId}`,
                    name: 'collection',
                    description: 'collection description',
                    categories: [
                        {name: 'Title', subcategories: []}
                    ],
                    __v: 0
                }])},
                artworkCategoriesHaveValidFormat: false,
                statusCode: 400,
                error: "Incorrect request body provided"
            },
            {
                payload: {
                    categories: [{name: 'Title', values: ['Title'], subcategories: []}],
                    collectionName: 'collection'
                },
                create: undefined,
                find: {exec: () => Promise.resolve([])},
                artworkCategoriesHaveValidFormat: true,
                statusCode: 404,
                error: "Collection not found"
            }
        ])(`createArtwork should respond with status $statusCode and correct error message`,
            async ({
                       payload,
                       create,
                       find,
                       artworkCategoriesHaveValidFormat,
                       statusCode,
                       error
                   }) => {
                mockCreate.mockReturnValue(create)
                mockFind.mockReturnValue(find)
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

    describe('PUT endpoints', () => {
        test("editArtwork should respond with status 201 and correct body", async () => {
            mockReplaceOne.mockReturnValue({
                exec: () => Promise.resolve({
                    acknowledged: true,
                    modifiedCount: 1,
                    upsertedId: null,
                    upsertedCount: 0,
                    matchedCount: 1
                })
            })
            const payload = {
                categories: [{name: 'Title', values: ['New Title'], subcategories: []}],
                collectionName: 'collection'
            }

            const res = await request(app)
                .put('/edit/66ce0bf156199c1b8df5db7d')
                .send(payload)
                .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        const replaceOneNoMatchResponse = {
            exec: () => Promise.resolve({
                acknowledged: true,
                modifiedCount: 0,
                upsertedId: null,
                upsertedCount: 0,
                matchedCount: 0
            })
        }

        test.each([
            {
                payload: {},
                replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {categories: [{name: 'Title', values: ['New Title'], subcategories: []}]},
                replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {collectionName: 'collection'},
                replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {
                    categories: [{name: 'Title', values: ['New Title'], subcategories: []}],
                    collectionName: 'collection'
                },
                replaceOne: {exec: () => {throw Error()}}, statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    categories: [{name: 'Title', values: ['New Title'], subcategories: []}],
                    collectionName: 'collection'
                },
                replaceOne: replaceOneNoMatchResponse, statusCode: 404, error: 'Artwork not found'
            }
        ])(`editArtwork should respond with status $statusCode and correct error message`,
            async ({
                       payload,
                       replaceOne,
                       statusCode,
                       error
                   }) => {
                mockReplaceOne.mockReturnValue(replaceOne)

                const res = await request(app)
                    .put('/edit/66ce0bf156199c1b8df5db7d')
                    .send(payload)
                    .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )
    })

    describe('DELETE endpoints', () => {

        const startSessionDefaultReturnValue = Promise.resolve({
            withTransaction: (async (transactionFunc: Function) => {
                await transactionFunc()
            }),
            endSession: jest.fn()      
        })

        test("deleteArtworks should respond with status 200 and correct body", async () => {
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCountDocuments.mockReturnValue({
                exec: () => Promise.resolve(2)
            })
            mockDeleteMany.mockReturnValue({
                exec: () => Promise.resolve({acknowledged: true, deletedCount: 2})
            })
            const payload = {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']}

            const res = await request(app)
                .delete('/delete')
                .send(payload)
                .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                payload: {},
                startSession: () => startSessionDefaultReturnValue,
                countDocuments: undefined, deleteMany: undefined,
                statusCode: 400, error: 'Incorrect request body provided'
            },
            {
                payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
                startSession: () => {throw Error()},
                countDocuments: undefined, deleteMany: undefined,
                statusCode: 503, error: `Database unavailable`
            },
            {
                payload: {ids: []},
                startSession: () => startSessionDefaultReturnValue,
                countDocuments: undefined, deleteMany: undefined,
                statusCode: 400, error: "Artworks not specified"
            },
            {
                payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
                startSession: () => startSessionDefaultReturnValue,
                countDocuments: {exec: () => {throw Error()}}, deleteMany: undefined,
                statusCode: 503, error: "Database unavailable"
            },
            {
                payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
                startSession: () => startSessionDefaultReturnValue,
                countDocuments: {exec: () => Promise.resolve(2)}, deleteMany: {exec: () => {throw Error()}},
                statusCode: 503, error: "Database unavailable"
            },
            {
                payload: {ids: ['662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc']},
                startSession: () => startSessionDefaultReturnValue,
                countDocuments: {exec: () => Promise.resolve(1)}, deleteMany: undefined,
                statusCode: 404, error: "Artworks not found"
            },
        ])(`deleteArtworks should respond with status $statusCode and correct error message`,
            async ({payload, startSession, countDocuments, deleteMany, statusCode, error}) => {
                mockStartSession.mockImplementation(startSession)       
                mockCountDocuments.mockReturnValue(countDocuments)
                mockDeleteMany.mockReturnValue(deleteMany)

                const res = await request(app)
                    .delete('/delete')
                    .send(payload)
                    .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )
    })
})