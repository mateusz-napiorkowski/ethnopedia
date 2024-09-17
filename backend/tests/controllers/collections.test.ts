import { describe, expect, test, jest, beforeEach } from "@jest/globals"
const express = require("express")
const request = require("supertest")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const CollectionsRouter = require("../../routes/collection")

const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
	startSession: () => mockStartSession()
}))

const mockFindOne = jest.fn()
const mockCreate = jest.fn()
jest.mock("../../models/collection", () => ({
	findOne: () => mockFindOne(),
    create: () => mockCreate()
}))

jest.mock("../../models/artwork", () => ({

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
            mockFindOne.mockReturnValue({
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
            mockFindOne.mockReturnValue(findOne)

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
            mockFindOne.mockReturnValue({ exec: () => Promise.resolve(null) })
            mockCreate.mockReturnValue(collectionPromise)
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
            mockFindOne.mockReturnValue(findOne)
            mockCreate.mockImplementation(() => {throw Error()})

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
})