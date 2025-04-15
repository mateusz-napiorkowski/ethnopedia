import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import DataImportRouter from "../../routes/dataImport";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
    startSession: () => mockStartSession()
}))

const mockPrepRecords = jest.fn()
jest.mock("../../utils/data-import", () => ({
    prepRecords: () => mockPrepRecords(),
    findMissingParentCategories: () => mockFindMissingParentCategories()
}))

const mockFindMissingParentCategories = jest.fn()
const mockTransformCategoriesArrayToCategoriesObject = jest.fn()
jest.mock("../../utils/categories", () => ({
    findMissingParentCategories: () => mockFindMissingParentCategories(),
    transformCategoriesArrayToCategoriesObject: () => mockTransformCategoriesArrayToCategoriesObject()
}))

const mockFind = jest.fn()
const mockCollectionCreate = jest.fn()
jest.mock("../../models/collection", () => ({
    find: () => mockFind(),
    create: () => mockCollectionCreate()
}))

const mockInsertMany = jest.fn()
jest.mock("../../models/artwork", () => ({
    insertMany: () => mockInsertMany()
}))

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn()
}))

const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"
const collectionId = "66f2194a6123d7f50558cd8f"

describe('data-import controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(DataImportRouter)
    })


    describe('POST endpoints', () => {
        const artworkId = "66ce0bf156199c1b8df5db7d"
        const startSessionDefaultReturnValue = Promise.resolve({
            withTransaction: (async (transactionFunc: Function) => {
                await transactionFunc()
            }),
            endSession: jest.fn()      
        })

        
        test("importData should respond with status 201 and correct body", async () => {
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockPrepRecords.mockImplementation(() => {})
            mockFind.mockReturnValue({exec: () => Promise.resolve([
                {
                  _id: `${artworkId}`,
                  name: 'collection',
                  description: 'collection description',
                  __v: 0
                }
              ])})
            mockInsertMany.mockReturnValue([
                {
                  _id: `${artworkId}`,
                  categories: [ { name: 'Title', value:  'An artwork title', subcategories: [] } ],
                  collectionName: 'collection',
                  __v: 0,
                  createdAt: '2024-09-25T02:43:33.416Z',
                  updatedAt: '2024-09-25T02:43:33.416Z'
                }
              ])
            const payload = {
                importData: [["Title"], ["An artwork title"]],
                collectionId: collectionId
            }

            const res = await request(app)
                .post('/')
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
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecords: () => []
            },
            {
                payload: {collectionId: collectionId},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecords: () => []
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]]},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecords: () => []
            },
            {
                payload: {importData: [["Title"]], collectionId: collectionId},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecords: () => []
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                statusCode: 503, error: 'Database unavailable',
                startSession: () => startSessionDefaultReturnValue,
                find: () => {throw Error()},
                prepRecords: () => [] 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                statusCode: 503, error: 'Database unavailable',
                startSession: () => {throw Error()},
                find: undefined,
                prepRecords: () => [] 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                statusCode: 404, error: 'Collection not found',
                startSession: () => startSessionDefaultReturnValue,
                find: {exec: () => Promise.resolve([])},
                prepRecords: () => [ { categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ], collectionName: 'collection' } ] 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                startSession: () => startSessionDefaultReturnValue,
                statusCode: 400, error: 'Invalid data in the spreadsheet file',
                find: {exec: () => Promise.resolve([
                    {
                      _id: `${artworkId}`,
                      name: 'collection',
                      description: 'collection description',
                      __v: 0
                    }
                  ])},
                prepRecords: () => {throw Error('Invalid data in the spreadsheet file')} 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                startSession: () => startSessionDefaultReturnValue,
                statusCode: 503, error: 'Database unavailable',
                find: {exec: () => Promise.resolve([
                    {
                      _id: `${artworkId}`,
                      name: 'collection',
                      description: 'collection description',
                      __v: 0
                    }
                  ])},
                prepRecords: () => [ { categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ], collectionName: 'collection' } ] 
            },
        ])(`importData should respond with status $statusCode and correct error message`,
            async ({ payload, statusCode, error, startSession, find, prepRecords }) => {
                mockStartSession.mockImplementation(startSession)
                mockPrepRecords.mockImplementation(prepRecords)
                mockFind.mockReturnValue(find)
                mockInsertMany.mockImplementation(() => {throw Error()})
                
                const res = await request(app)
                    .post('/')
                    .send(payload)
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')

                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )

        const collectionCreatePromise = Promise.resolve({
            _id: "66c4e516d6303ed5ac5a8e55",
            name: 'collection',
            description: 'collection-description',
            categories: [{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}],
            __v: 0
        })

        test("importDataAsCollection should respond with status 201 and correct body", async () => {
            const payload = {
                importData: [["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]],
                collectionName: 'collection',
                description: "collection-description"
            }
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockFindMissingParentCategories.mockImplementation(() => [])
            mockTransformCategoriesArrayToCategoriesObject.mockImplementation(() => ([{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}]))
            mockCollectionCreate.mockImplementation(() => collectionCreatePromise)
            mockPrepRecords.mockImplementation(() => [ { categories: [ { name: 'Title', value: 'An artwork title', subcategories: [{ name: 'subtitle', value: 'An artwork subtitle', subcategories: [] }] } ], collectionName: 'collection' } ])
            mockInsertMany.mockImplementation(() => {})
            
            const res = await request(app)
                .post(`/${payload.collectionName}`)
                .send(payload)
                .set('Authorization', `Bearer ${jwtToken}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                payload: {
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 400, error: "Incorrect request body provided"
            },
            {
                payload: {
                    importData: [["Title"]],
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 400, error: "Incorrect request body provided"
            },
            {
                payload: {
                    importData: [["Title"], ["An artwork title"]],
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 400, error: "Incorrect request body provided"
            },
            {
                payload: {
                    importData: [["Title"], ["An artwork title"]],
                    collectionName: 'collection',
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 400, error: "Incorrect request body provided"
            },
            {
                payload: {
                    importData: [["Title"], ["An artwork title"]],
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => {throw Error()},
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 503, error: 'Database unavailable',
            },
            {
                payload: {
                    importData: [["Title", "Title.subtitle.subsubtitle"], ["An artwork title", "An artwork subsubtitle"]],
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => ["Title.subtitle"],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 400, error: 'Invalid categories data',
            },
            {
                payload: {
                    importData: [["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]],
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => ([{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}]),
                create: () => {throw Error()},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 503, error: 'Database unavailable'
            },
            {
                payload: {
                    importData: [["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]],
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => ([{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}]),
                create: () => collectionCreatePromise,
                prepRecords: () => {throw Error('Invalid data in the spreadsheet file')},
                insertMany: () => {},
                statusCode: 400, error: 'Invalid data in the spreadsheet file',
            },
            {
                payload: {
                    importData: [["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]],
                    collectionName: 'collection',
                    description: "collection-description"
                },
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => ([{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}]),
                create: () => collectionCreatePromise,
                prepRecords: () => [ { categories: [ { name: 'Title', value: 'An artwork title', subcategories: [{ name: 'subtitle', value: 'An artwork subtitle', subcategories: [] }] } ], collectionName: 'collection' } ],
                insertMany: () => {throw Error()},
                statusCode: 503, error: 'Database unavailable',
            },
        ])("importDataAsCollection should respond with status $statusCode and correct error message", async ({
            payload, startSession, findMissingParentCategories, transformCategoriesArrayToCategoriesObject, create, insertMany, prepRecords, statusCode, error}) => {
            mockStartSession.mockImplementation(startSession)
            mockFindMissingParentCategories.mockImplementation(findMissingParentCategories)
            mockTransformCategoriesArrayToCategoriesObject.mockImplementation(transformCategoriesArrayToCategoriesObject)
            mockCollectionCreate.mockImplementation(create)
            mockPrepRecords.mockImplementation(prepRecords)
            mockInsertMany.mockImplementation(insertMany)
            
            const res = await request(app)
                .post(`/${payload.collectionName}`)
                .send(payload)
                .set('Authorization', `Bearer ${jwtToken}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })  
})