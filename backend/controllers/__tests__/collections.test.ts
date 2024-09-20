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
    const startSessionDefaultImplementation = () => Promise.resolve({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
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
            {statusCode: 503, error: 'Database unavailable', findOne: { exec: () => Promise.reject() }},
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
            mockStartSession.mockImplementation(startSessionDefaultImplementation)
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
                error: 'Incorrect request body provided', findOne: undefined, startSession: startSessionDefaultImplementation}, 
            {payload: { name: 'collection' }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: startSessionDefaultImplementation},
            {payload: { description: 'collection description' }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: startSessionDefaultImplementation},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 503,
                error: "Couldn't establish session for database transaction", findOne: undefined, startSession: () => Promise.reject()},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => Promise.reject() }, startSession: startSessionDefaultImplementation},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 409,
                error: 'Collection with provided name already exists', findOne: { exec: () => collectionPromise }, startSession: startSessionDefaultImplementation},
            {payload: { name: 'collection', description: 'collection description' }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => Promise.resolve(null) }, startSession: startSessionDefaultImplementation}
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
            mockStartSession.mockImplementation(startSessionDefaultImplementation)
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
                startSession: startSessionDefaultImplementation,
                collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {   
                statusCode: 400, error: "Collections not specified",
                payload: { ids: [] },
                startSession: startSessionDefaultImplementation,
                collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {
                statusCode: 503, error: "Couldn't establish session for database transaction",
                payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
                startSession: () => Promise.reject(), collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {   
                payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
                statusCode: 404, error: "Collections not found",
                startSession: startSessionDefaultImplementation, collectionFind: collectionFindIncomplete,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Couldn't complete database transaction`,
                startSession: startSessionDefaultImplementation, collectionFind: () => Promise.reject(),
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Couldn't complete database transaction`,
                startSession: startSessionDefaultImplementation, collectionFind: collectionFindDefault,
                artworkDeleteMany: {exec: () => Promise.reject()},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Couldn't complete database transaction`,
                startSession: startSessionDefaultImplementation, collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.reject()}},
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