import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import DataImportRouter from "../../routes/dataImport";
import path from "path";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
    startSession: () => mockStartSession()
}))

const mockPrepRecordsAndFiles = jest.fn()
jest.mock("../../utils/data-import", () => ({
    prepRecordsAndFiles: () => mockPrepRecordsAndFiles(),
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
const mockBulkWrite = jest.fn()
jest.mock("../../models/artwork", () => ({
    insertMany: () => mockInsertMany(),
    bulkWrite: () => mockBulkWrite()
}))

const mockJwtVerify = jest.fn()
jest.mock("jsonwebtoken", () => ({
	verify: () => mockJwtVerify()
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
        const user = {
            username: 'example user',
            firstName: 'example user',
            userId: '675ddf3b1e6d01766fbc5b17',
            iat: 1763262553,
            exp: 1764262553
        }

        
        test("importData should respond with status 201 and correct body", async () => {
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockPrepRecordsAndFiles.mockReturnValue({records: [
                {
                    _id: "68af30c1c32f825809e7ac7c",
                    categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ],
                    collectionName: 'collection',
                    files: []
                }
            ]})
            mockFind.mockReturnValue({exec: () => Promise.resolve([
                {
                  _id: `${artworkId}`,
                  name: 'collection',
                  description: 'collection description',
                  __v: 0
                }
              ])})
            mockBulkWrite.mockReturnValue({
                insertedCount: 0,
                matchedCount: 0,
                modifiedCount: 0,
                deletedCount: 0,
                upsertedCount: 1,
                upsertedIds: {'0': "68af30c1c32f825809e7ac7c"},
                insertedIds: {}
            })
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
                prepRecordsAndFiles: () => ({records: []})
            },
            {
                payload: {collectionId: collectionId},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecordsAndFiles: () => ({records: []})
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]]},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecordsAndFiles: () => ({records: []})
            },
            {
                payload: {importData: [["Title"]], collectionId: collectionId},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecordsAndFiles: () => ({records: []})
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                statusCode: 503, error: 'Database unavailable',
                startSession: () => startSessionDefaultReturnValue,
                find: () => {throw Error()},
                prepRecordsAndFiles: () => ({records: []})
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                statusCode: 503, error: 'Database unavailable',
                startSession: () => {throw Error()},
                find: undefined,
                prepRecordsAndFiles: () => ({records: []}) 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]], collectionId: collectionId},
                statusCode: 404, error: 'Collection not found',
                startSession: () => startSessionDefaultReturnValue,
                find: {exec: () => Promise.resolve([])},
                prepRecordsAndFiles: () => [] 
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
                prepRecordsAndFiles: () => {throw Error('Invalid data in the spreadsheet file')} 
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
                prepRecordsAndFiles: () => [] 
            },
        ])(`importData should respond with status $statusCode and correct error message`,
            async ({ payload, statusCode, error, startSession, find, prepRecordsAndFiles: prepRecords }) => {
                mockStartSession.mockImplementation(startSession)
                mockPrepRecordsAndFiles.mockImplementation(prepRecords)
                mockFind.mockReturnValue(find)
                mockBulkWrite.mockImplementation(() => {throw Error()})
                
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

        const collectionCreatePromise = Promise.resolve([{
            _id: "66c4e516d6303ed5ac5a8e55",
            name: 'collection',
            description: 'collection-description',
            categories: [{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}],
            __v: 0
        }])

        test("importDataAsCollection should respond with status 201 and correct body", async () => {
            const payload = {
                importData: `[["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]]`,
                collectionName: 'collection',
                description: "collection-description",
                isCollectionPrivate: "false"
            }
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockFindMissingParentCategories.mockImplementation(() => [])
            mockTransformCategoriesArrayToCategoriesObject.mockImplementation(() => ([{name: "Title", subcategories: []}]))
            mockCollectionCreate.mockImplementation(() => collectionCreatePromise)
            mockPrepRecordsAndFiles.mockReturnValue({
                records: [
                    {
                        _id: "68af30c1c32f825809e7ac7c",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ],
                        collectionName: 'collection',
                        files: []
                    },
                ],
                uploadedFilesCount: 0, 
                failedUploadsCount: 0,
                failedUploadsCauses: {}
            })
            mockInsertMany.mockReturnValue(
                [
                    {
                        _id: "68af30c1c32f825809e7ac7c",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ],
                        collectionName: 'collection',
                        files: []
                    }
                ] 
            )
            mockJwtVerify.mockReturnValue(user)
            
            const res = await request(app)
                .post(`/newCollection`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .set('Accept', 'application/json')
                .field("importData", payload.importData)
                .field("collectionName", payload.collectionName)
                .field("description", payload.description)
                .field("isCollectionPrivate", payload.isCollectionPrivate)

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                payload: {
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title"], ["An artwork title"]]`,
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title"], ["An artwork title"]]`,
                    collectionName: 'collection',
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `unparsable import data`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
                startSession: () => {throw Error()},
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => {},
                create: () => {},
                prepRecords: () => {},
                insertMany: () => {},
                statusCode: 400, error: 'Incorrect request body provided',
            },
            {
                payload: {
                    importData: `[["Title"], ["An artwork title"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                },
                archivePath: undefined,
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
                    importData: `[["Title"], ["An artwork title"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "not a boolean"
                },
                archivePath: undefined,
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
                    importData: `[["Title"], ["An artwork title"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title", "Title.subtitle.subsubtitle"], ["An artwork title", "An artwork subsubtitle"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
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
                    importData: `[["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: undefined,
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => ([{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}]),
                create: () => collectionCreatePromise,
                prepRecords: () => [ { categories: [ { name: 'Title', value: 'An artwork title', subcategories: [{ name: 'subtitle', value: 'An artwork subtitle', subcategories: [] }] } ], collectionName: 'collection' } ],
                insertMany: () => {throw Error()},
                statusCode: 503, error: 'Database unavailable',
            },
            {
                payload: {
                    importData: `[["Title", "Title.subtitle"], ["An artwork title", "An artwork subtitle"]]`,
                    collectionName: 'collection',
                    description: "collection-description",
                    isCollectionPrivate: "false"
                },
                archivePath: `utils/files-for-upload/FileForUpload.mid`,
                startSession: () => startSessionDefaultReturnValue,
                findMissingParentCategories: () => [],
                transformCategoriesArrayToCategoriesObject: () => ([{name: "Title", subcategories: [{name: "subtitle", subcategories: []}]}]),
                create: () => collectionCreatePromise,
                prepRecords: () => [ { categories: [ { name: 'Title', value: 'An artwork title', subcategories: [{ name: 'subtitle', value: 'An artwork subtitle', subcategories: [] }] } ], collectionName: 'collection' } ],
                insertMany: () => {throw Error()},
                statusCode: 400, error: 'Invalid file extension',
                
            }
        ])("importDataAsCollection should respond with status $statusCode and correct error message", async ({
            payload, startSession, findMissingParentCategories, transformCategoriesArrayToCategoriesObject, create, insertMany, prepRecords, archivePath, statusCode, error}) => {
            mockStartSession.mockImplementation(startSession)
            mockFindMissingParentCategories.mockImplementation(findMissingParentCategories)
            mockTransformCategoriesArrayToCategoriesObject.mockImplementation(transformCategoriesArrayToCategoriesObject)
            mockCollectionCreate.mockImplementation(create)
            mockPrepRecordsAndFiles.mockImplementation(prepRecords)
            mockInsertMany.mockImplementation(insertMany)
            mockJwtVerify.mockReturnValue(user)

            let req = request(app)
                .post(`/newCollection`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .set('Accept', 'application/json')
            if(payload.importData)
                req = req.field("importData", payload.importData)
            if(payload.collectionName)
                req = req.field("collectionName", payload.collectionName)
            if(payload.description)
                req = req.field("description", payload.description)
            if(archivePath)
                req = req.attach("file", path.resolve(__dirname, archivePath))
            if(payload.isCollectionPrivate)
                req = req.field("isCollectionPrivate", payload.isCollectionPrivate)

            const res = await req

            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })  
})