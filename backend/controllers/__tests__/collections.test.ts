import { describe, expect, test, jest, beforeEach } from "@jest/globals"
import express from "express";
import request from "supertest";
import bodyParser from "body-parser";
import CollectionsRouter from "../../routes/collection";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
	startSession: () => mockStartSession()
}))

const mockCollectionFindOne = jest.fn()
const mockCollectionCreate = jest.fn()
const mockCollectionFind = jest.fn()
const mockCollectionDeleteMany = jest.fn()
jest.mock("../../models/collection", () => ({
	findOne: () => mockCollectionFindOne(),
    create: () => mockCollectionCreate(),
    find: () => mockCollectionFind(),
    deleteMany: () => mockCollectionDeleteMany(),
}))

const mockArtworkDeleteMany = jest.fn()
jest.mock("../../models/artwork", () => ({
    deleteMany: () => mockArtworkDeleteMany(),
}))

jest.mock("jsonwebtoken", () => ({
	verify: jest.fn()
}))
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
	+ "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
	+ "N-rDSjRS3kApqlA"

describe('collections controller', () =>{
    beforeEach(() => {
		jest.resetAllMocks()
	})
    const startSessionDefaultReturnValue = Promise.resolve({
        withTransaction: (async (transactionFunc: Function) => {
            await transactionFunc()
        }),
        endSession: jest.fn()      
    })
    describe('GET endpoints', () =>{
        test("getCollection should respond with status 200 and correct body", async () => {
            mockCollectionFindOne.mockReturnValue({
                exec: () => Promise.resolve({
                    _id: "66c4e516d6303ed5ac5a8e55",
                    name: 'collection',
                    description: 'collection description',
                    __v: 0
                })
            })

            const res = await request(app.use(CollectionsRouter))
            .get('/collection');
    
            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {statusCode: 503, error: 'Database unavailable', findOne: { exec: () => {throw Error()} }},
            {statusCode: 404, error: 'Collection not found', findOne: { exec: () => Promise.resolve(null) }}
        ])('getCollection should respond with status $statusCode and correct error message', async ({statusCode, error, findOne}) => {
            mockCollectionFindOne.mockReturnValue(findOne)

            const res = await request(app.use(CollectionsRouter))
            .get('/collection');
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })
 
    describe('POST endpoints', () =>{
        const collectionPromise = Promise.resolve({
            _id: "66c4e516d6303ed5ac5a8e55",
            name: 'collection',
            description: 'collection description',
            __v: 0
        })
        test("createCollection should respond with status 201 and correct body", async () => {
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFindOne.mockReturnValue({ exec: () => Promise.resolve(null) })
            mockCollectionCreate.mockReturnValue(collectionPromise)
            const payload = { name: 'collection', description: 'collection description' }

            const res = await request(app.use(CollectionsRouter))
            .post('/create')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {payload: {}, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue}, 
            {payload: { name: 'collection' }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue},
            {payload: { description: 'collection description' }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 503,
                error: "Database unavailable", findOne: undefined, startSession: () => {throw Error()}},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => {throw Error()} }, startSession: () => startSessionDefaultReturnValue},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 409,
                error: 'Collection with provided name already exists', findOne: { exec: () => collectionPromise }, startSession: () => startSessionDefaultReturnValue},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => Promise.resolve(null) }, startSession: () => startSessionDefaultReturnValue}
        ])('createCollection should respond with status $statusCode and correct error message', async ({payload, statusCode, error, findOne, startSession}) => {
            mockStartSession.mockImplementation(startSession)
            mockCollectionFindOne.mockReturnValue(findOne)
            mockCollectionCreate.mockImplementation(() => {throw Error()})

            const res = await request(app.use(CollectionsRouter))
            .post('/create')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })

    describe('DELETE endpoints', () =>{
        const collectionFindDefault = {
        exec: () => Promise.resolve([
                {
                  _id: "66e9c0d8acd80b0970c81b4b",
                  name: '123',
                  description: '',
                  __v: 0
                },
                {
                  _id: "66e9c0ddacd80b0970c81b56",
                  name: '456',
                  description: '',
                  __v: 0
                }
            ])
        }
        const collectionFindIncomplete = {
            exec: () => Promise.resolve([
                {
                  _id: "66e9c0d8acd80b0970c81b4b",
                  name: '123',
                  description: '',
                  __v: 0
                }
            ])
        }

        test("deleteCollections should respond with status 200 and correct body", async () => {
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFind.mockReturnValue(collectionFindDefault)
            mockArtworkDeleteMany.mockReturnValueOnce({ exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })})
            mockArtworkDeleteMany.mockReturnValueOnce({ exec: () => Promise.resolve({ acknowledged: true, deletedCount: 3 })})
            mockCollectionDeleteMany.mockReturnValue({ exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })})
            const payload = { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }
            const res = await request(app.use(CollectionsRouter))
            .delete('/delete')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                statusCode: 400, error: 'Incorrect request body provided', 
                payload: {},
                startSession: () => startSessionDefaultReturnValue,
                collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {   
                statusCode: 400, error: "Collections not specified",
                payload: { ids: [] },
                startSession: () => startSessionDefaultReturnValue,
                collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {
                statusCode: 503, error: "Database unavailable",
                payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
                startSession: () => {throw Error()}, collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {   
                payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
                statusCode: 404, error: "Collections not found",
                startSession: () => startSessionDefaultReturnValue, collectionFind: collectionFindIncomplete,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Database unavailable`,
                startSession: () => startSessionDefaultReturnValue, collectionFind: () => {throw Error()},
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Database unavailable`,
                startSession: () => startSessionDefaultReturnValue, collectionFind: collectionFindDefault,
                artworkDeleteMany: {exec: () => {throw Error()}},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Database unavailable`,
                startSession: () => startSessionDefaultReturnValue, collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => {throw Error()}}},
        ])('deleteCollections should respond with status $statusCode and correct error message', async ({statusCode, error, payload, startSession, collectionFind, artworkDeleteMany, collectionDeleteMany}) => {
            mockStartSession.mockImplementation(startSession)
            mockCollectionFind.mockReturnValue(collectionFind)
            mockArtworkDeleteMany.mockReturnValue(artworkDeleteMany)
            mockCollectionDeleteMany.mockReturnValue(collectionDeleteMany)

            const res = await request(app.use(CollectionsRouter))
            .delete('/delete')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })
})