import { describe, expect, test, jest, beforeEach } from "@jest/globals"
const express = require("express")
const request = require("supertest")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const CollectionsRouter = require("../../routes/collection")

const mockFindOne = jest.fn()
const mockCreate = jest.fn()
jest.mock("../../models/collection", () => ({
	findOne: () => mockFindOne(),
    create: () => mockCreate()
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
                error: 'Incorrect request body provided'},
            {payload: { name: 'testowa' }, statusCode: 400,
                error: 'Incorrect request body provided'},
            {payload: { description: 'testowa kolekcja' }, statusCode: 400,
                error: 'Incorrect request body provided'},
            {payload: { name: 'testowa', description: 'testowa kolekcja' }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => Promise.reject() }},
            {payload: { name: 'testowa', description: 'testowa kolekcja' }, statusCode: 409,
                error: 'Collection with provided name already exists', findOne: { exec: () => collectionPromise }},
            {payload: { name: 'testowa', description: 'testowa kolekcja' }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => Promise.resolve(null) }}
        ])('createCollection should respond with status $statusCode and correct error message', async ({payload, statusCode, error, findOne}) => {
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