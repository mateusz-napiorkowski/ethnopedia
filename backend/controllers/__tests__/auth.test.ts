import { describe, expect, test, jest, beforeEach } from "@jest/globals"
const express = require("express")
const request = require("supertest")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const AuthRouter = require("../../routes/auth")

const mockFindOne = jest.fn()
const mockFindByIdAndRemove = jest.fn()
const mockCreate = jest.fn()
jest.mock("../../models/user", () => ({
	findOne: () => mockFindOne(),
    create: () => mockCreate(),
    findByIdAndRemove: () => mockFindByIdAndRemove()
}))

const bcrypt = require("bcrypt")
jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn()
}))

const mockSign = jest.fn()
const mockVerify = jest.fn()
jest.mock("jsonwebtoken", () => ({
	sign: () => mockSign(),
    verify: () => mockVerify()
}))
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
	+ "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
	+ "N-rDSjRS3kApqlA"

const mockIsValidObjectId = jest.fn()
jest.mock('mongoose', () => ({
	isValidObjectId: () => mockIsValidObjectId()
}))

describe('auth controller', () =>{
    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('POST endpoints', () => {
        const existingUser = { exec: () => Promise.resolve({
            _id: "66d71fd54c148fb8f827c2c3",
            username: 'existing user',
            password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
            firstName: 'existing user',
            accountCreationDate: '2024-09-01T23:20:24.293Z',
            __v: 0
        })}

        test("registerUser should respond with status 201 and correct body", async () => {
            mockFindOne.mockReturnValue({
                exec: () => Promise.resolve(null)
            })
            bcrypt.hash.mockImplementation((password: String, saltRounds: number, callback: Function) => {
                callback(undefined, 'hasl1242o2')    
            })
            mockCreate.mockReturnValue(Promise.resolve({
                username: 'user',
                password: '$2b$10$oYpcXLbpzL7kHK8M3k9SneS6aitfKEjmPw72O9kTXaYscW0QzQ0Ym',
                firstName: 'user',
                _id: "66d71fd54c148fb8f827c2c3",
                accountCreationDate: "2024-09-03T15:33:04.290Z",
                __v: 0
            }))
            mockSign.mockReturnValue(jwtToken)
            const payload = { username: 'user', firstName: 'user', password: 'hasl1242o2' }
            const res = await request(app.use(AuthRouter))
            .post('/register')
            .send(payload)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })
        
        test.each([
            {payload: { }, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined},
            {payload: { firstName: 'user', password: 'hasl1242o2' }, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined},
            {payload: { username: 'user', password: 'hasl1242o2' }, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined},
            {payload: { username: 'user', firstName: 'user'}, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined},
            {payload: { username: 'istniejaca', firstName: 'istniejaca', password: 'hasl1242o2' }, statusCode: 409, error: "User already exists",
                findOne: existingUser, callbackError: undefined},
            {payload: { username: 'user', firstName: 'user', password: 'hasl1242o2' }, statusCode: 500, error: "Password encryption error",
                findOne: { exec: () => {return Promise.resolve(null)}}, callbackError: Error()},
            {payload: { username: 'user', firstName: 'user', password: 'hasl1242o2' }, statusCode: 503, error: "Database unavailable",
                findOne: { exec: () => { return Promise.reject() } }, callbackError: undefined},
            {payload: { username: 'user', firstName: 'user', password: 'hasl1242o2' }, statusCode: 503, error: "Database unavailable",
                findOne: { exec: () => {return Promise.resolve(null)}}, callbackError: undefined}
        ])('registerUser should respond with status $statusCode and correct error message', async ({payload, statusCode, error, findOne, callbackError}) => {
            mockFindOne.mockReturnValue(findOne)
            bcrypt.hash.mockImplementation((password: String, saltRounds: number, callback: Function) => {
                callback(callbackError, 'hasl1242o2') 
            })
            mockCreate.mockImplementation(() => {throw Error()})
            const res = await request(app.use(AuthRouter))
                .post('/register')
                .send(payload)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')

            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })

        test("loginUser should respond with status 200 and correct body", async () => {
            mockFindOne.mockReturnValue(existingUser)
            bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
                callback(undefined, true)    
            })
            mockSign.mockReturnValue(jwtToken)
            const payload = { username: 'user', password: 'hasl1242o2' }
            const res = await request(app.use(AuthRouter))
            .post('/login')
            .send(payload)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {payload: { }, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined, passwordCorrect: undefined},
            {payload: { username: 'user' }, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined, passwordCorrect: undefined},
            {payload: { password: 'hasl1242o2' }, statusCode: 400, error: "Incorrect request body provided",
                findOne: undefined, callbackError: undefined, passwordCorrect: undefined},
            {payload: { username: 'user', password: 'hasl1242o2' }, statusCode: 503, error: "Database unavailable",
                findOne: { exec: () => Promise.reject() }, callbackError: undefined, passwordCorrect: undefined},
            {payload: { username: 'user', password: 'hasl1242o2' }, statusCode: 500, error: "Internal server error",
                findOne: existingUser, callbackError: Error(), passwordCorrect: true},
            {payload: { username: 'user', password: 'hasl1242o2' }, statusCode: 404, error: "Invalid username or password",
                findOne: { exec: () => {return Promise.resolve(null)}}, callbackError: undefined, passwordCorrect: undefined},
            {payload: { username: 'user', password: 'hasl1242o2' }, statusCode: 404, error: "Invalid username or password",
                findOne: existingUser, callbackError: undefined, passwordCorrect: false} 
        ])('loginUser should respond with status $statusCode and correct error message', async ({payload, statusCode, error, findOne, callbackError, passwordCorrect}) => {
            mockFindOne.mockReturnValue(findOne)
            bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
                callback(callbackError, passwordCorrect)    
            })
            const res = await request(app.use(AuthRouter))
            .post('/login')
            .send(payload)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })

    describe('DELETE endpoints', () => {
        const userId = '66d71fd54c148fb8f827c2c3'
        const deletedUserData = {
            exec: () => Promise.resolve({
                _id: userId,
                username: 'user',
                password: '$2b$10$zv3up3rZKzJv9bY3n8Hvh.dR1UcEoC.bH5obaPm/mxPSDGqZ9vlrO',
                firstName: 'user',
                accountCreationDate: "2024-09-03T14:39:25.536Z",
                __v: 0
            })
        }
        test("deleteUser should respond with status 200 and correct body", async () => {
            mockIsValidObjectId.mockReturnValue(true)
            mockFindByIdAndRemove.mockReturnValue(deletedUserData)

            const res = await request(app.use(AuthRouter))
            .delete('/66d71fd54c148fb8f827c2c3')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {statusCode: 400, error: `Invalid user id: ${userId}`,
                isValidObjectId: false, findByIdAndRemove: undefined},
            {statusCode: 503, error: 'Database unavailable',
                isValidObjectId: true, findByIdAndRemove: { exec: () => Promise.reject() }},
            {statusCode: 404, error: 'User not found',
                isValidObjectId: true, findByIdAndRemove: { exec: () => Promise.resolve(null) }}
        ])('deleteUser should respond with status $statusCode and correct error message', async ({statusCode, error, isValidObjectId, findByIdAndRemove}) => {
            mockIsValidObjectId.mockReturnValue(isValidObjectId)
            mockFindByIdAndRemove.mockReturnValue(findByIdAndRemove)
            const res = await request(app.use(AuthRouter))
            .delete(`/${userId}`)
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })
})