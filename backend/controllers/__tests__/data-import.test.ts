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
jest.mock("../../utils/controllers-utils/data-import", () => ({
    prepRecords: () => mockPrepRecords()
}))

const mockFind = jest.fn()
jest.mock("../../models/collection", () => ({
    find: () => mockFind()
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
                  categories: [ { name: 'Title', values: [ 'An artwork title' ], subcategories: [] } ],
                  collectionName: 'collection',
                  __v: 0,
                  createdAt: '2024-09-25T02:43:33.416Z',
                  updatedAt: '2024-09-25T02:43:33.416Z'
                }
              ])
            const payload = {
                importData: [["Title"], ["An artwork title"]],
                collectionName: 'collection'
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
                payload: {collectionName: 'collection'},
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
                payload: {importData: [["Title"]], collectionName: 'collection'},
                statusCode: 400, error: 'Incorrect request body provided',
                startSession: () => startSessionDefaultReturnValue,
                find: undefined,
                prepRecords: () => []
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]],collectionName: 'collection'},
                statusCode: 503, error: 'Database unavailable',
                startSession: () => startSessionDefaultReturnValue,
                find: () => {throw Error()},
                prepRecords: () => [] 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]],collectionName: 'collection'},
                statusCode: 503, error: 'Database unavailable',
                startSession: () => {throw Error()},
                find: undefined,
                prepRecords: () => [] 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]],collectionName: 'collection'},
                statusCode: 404, error: 'Collection not found',
                startSession: () => startSessionDefaultReturnValue,
                find: {exec: () => Promise.resolve([])},
                prepRecords: () => [ { categories: [ { name: 'Title', values: [ 'An artwork title' ], subcategories: [] } ], collectionName: 'collection' } ] 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]],collectionName: 'collection'},
                startSession: () => startSessionDefaultReturnValue,
                statusCode: 500, error: 'Error preparing data for database insertion',
                find: {exec: () => Promise.resolve([
                    {
                      _id: `${artworkId}`,
                      name: 'collection',
                      description: 'collection description',
                      __v: 0
                    }
                  ])},
                prepRecords: () => {throw Error('Error preparing data for database insertion')} 
            },
            {
                payload: {importData: [["Title"], ["An artwork title"]],collectionName: 'collection'},
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
                prepRecords: () => [ { categories: [ { name: 'Title', values: [ 'An artwork title' ], subcategories: [] } ], collectionName: 'collection' } ] 
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
    })
})