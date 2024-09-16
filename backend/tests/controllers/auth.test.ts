import { describe, expect, test, jest, beforeEach } from "@jest/globals"
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const AuthRouter = require("../../routes/auth")
const request = require("supertest")

const User = require("../../models/user")
const mockFindOne = jest.fn()
const mockCreate = jest.fn()
jest.mock("../../models/user", () => ({
	findOne: () => mockFindOne(),
    create: () => mockCreate(),
    findByIdAndRemove: jest.fn()
}))

const bcrypt = require("bcrypt")
jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn()
}))

const jwt = require("jsonwebtoken")
const mockSign = jest.fn()
jest.mock("jsonwebtoken", () => ({
	sign: () => mockSign(),
    verify: jest.fn()
}))

const mongoose = require('mongoose')
jest.mock('mongoose', () => ({
	isValidObjectId: jest.fn()
}))

describe('auth controller', () =>{
    beforeEach(() => {
        jest.resetAllMocks()
    })
    describe('POST endpoints', () => {
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
            mockSign.mockReturnValue("eyJhbGciOiJIAzI1NiIsXnR5cCI6IkpXVCJ4.eyJ1c2VybmFtZSI6ImQiLCJmaXJzdE5hbWUiOiJkIiwidXNlcklkIjoiNjZkNzQ5MDNjN2YxYjNiYTJmM2UyMjk3IiwiaWF0IjoxNzI1Mzg0OTYzLCJleHAiOjE3MjYzODQ5NjN9.I6rX0LpWoEyg-TLZEZ4gNW6VgG3OT9nyOq9NeqUnFx8")
            const payload = { username: 'user', firstName: 'user', password: 'hasl1242o2' }
            const res = await request(app.use(AuthRouter))
            .post('/register')
            .send(payload)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        const existingUser = {
            exec: () => Promise.resolve({
                    _id: "66d71fd54c148fb8f827c2c3",
                    username: 'existing user',
                    password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
                    firstName: 'existing user',
                    accountCreationDate: '2024-09-01T23:20:24.293Z',
                    __v: 0
                    })
        }
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
                findOne: { exec: () => {return Promise.resolve(null)}}, callbackError: Error("some error")},
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
          });
    })
})

// describe('loginUser tests', () =>{
//     test("Response has status 400 (incorrect payload)", async () => {
//         let payload = { }
//         let res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')
//         expect(res.status).toMatchInlineSnapshot(`400`)

//         payload = { username: 'user' }
//         res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')
//         expect(res.status).toMatchInlineSnapshot(`400`)

//         payload = { password: 'hasl1242o2' }
//         res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')
//         expect(res.status).toMatchInlineSnapshot(`400`)
//     })
//     test("Response has status 503 (can't check if provided username is already in the database)", async () => {
//         User.findOne.mockImplementationOnce(() => {
//             return {
//             	exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.reject()
//                 })
//           	}    
//         })
//         const payload = { username: 'user', password: 'hasl1242o2' }
//         const res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`503`)
//     })
//     test("Response has status 404 (user with provided username doesn't exist)", async () => {
//         User.findOne.mockImplementationOnce(() => {
//             return {
//             	exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.resolve(null)
//                 })
//           	}    
//         })
//         const payload = { username: 'user', password: 'hasl1242o2' }
//         const res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`404`)
//     })
//     test("Response has status 500 (password comparison unsuccessful)", async () => {
//         User.findOne.mockImplementationOnce(() => {
//             return {
//                 exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.resolve({
//                         _id: "66d71fd54c148fb8f827c2c3",
//                         username: 'istniejaca',
//                         password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
//                         firstName: 'istniejaca',
//                         accountCreationDate: '2024-09-01T23:20:24.293Z',
//                         __v: 0
//                       })
//                 })
//               }    
//         })
//         bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
//             callback(Error("some error"), true)    
//         })
//         const payload = { username: 'user', password: 'hasl1242o2' }
//         const res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`500`)
//     })
//     test("Response has status 404 (user with provided username exists but password is incorrect)", async () => {
//         User.findOne.mockImplementationOnce(() => {
//             return {
//                 exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.resolve({
//                         _id: "66d71fd54c148fb8f827c2c3",
//                         username: 'istniejaca',
//                         password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
//                         firstName: 'istniejaca',
//                         accountCreationDate: '2024-09-01T23:20:24.293Z',
//                         __v: 0
//                       })
//                 })
//               }    
//         })
//         bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
//             callback(undefined, false)    
//         })
//         const payload = { username: 'user', password: 'wrongpassword' }
//         const res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`404`)
//     })
//     test("Response has status 200 (login successful)", async () => {
//         User.findOne.mockImplementationOnce(() => {
//             return {
//                 exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.resolve({
//                         _id: "66d71fd54c148fb8f827c2c3",
//                         username: 'istniejaca',
//                         password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
//                         firstName: 'istniejaca',
//                         accountCreationDate: '2024-09-01T23:20:24.293Z',
//                         __v: 0
//                       })
//                 })
//               }    
//         })
//         bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
//             callback(undefined, true)    
//         })
//         const payload = { username: 'user', password: 'wrongpassword' }
//         const res = await request(app.use(AuthRouter))
//         .post('/login')
//         .send(payload)
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`200`)
//     })
//     afterEach(() => {
// 		jest.resetAllMocks()
// 	})
// })

// describe('deleteUser tests', () =>{
//     test("Response has status 400 (no jwt provided)", async () => {
//         jwt.verify.mockImplementationOnce(() => {throw new Error()})
//         const res = await request(app.use(AuthRouter))
//         .delete('/66d71fd54c148fb8f827c2c3')
// 		.set('Authorization', 'Bearer ')
//         .set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`400`)
//     })
//     test("Response has status 401 (invalid jwt)", async () => {
//         jwt.verify.mockImplementationOnce(() => {throw new Error()})
//         const res = await request(app.use(AuthRouter))
//         .delete('/66d71fd54c148fb8f827c2c3')
//         .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
//         .set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`401`)
//     })
//     test("Response has status 400 (user ObjectId is invalid)", async () => {
//         mongoose.isValidObjectId.mockImplementationOnce(() => {return false})
//         jwt.verify.mockImplementationOnce(() => {return {
// 			username: 'testowy',
// 			firstName: 'testowy',
// 			userId: '66d71fd54c148fb8f827c2c3',
// 			iat: 1725211851,
// 			exp: 1726211851
// 		}})
//         const res = await request(app.use(AuthRouter))
//         .delete('/invalidId')
//         .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
//         .set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`400`)
//     })
//     test("Response has status 503 (couldn't access database to delete user entry)", async () => {
//         mongoose.isValidObjectId.mockImplementationOnce(() => {return true})
//         jwt.verify.mockImplementationOnce(() => {return {
// 			username: 'testowy',
// 			firstName: 'testowy',
// 			userId: '66d71fd54c148fb8f827c2c3',
// 			iat: 1725211851,
// 			exp: 1726211851
// 		}})
//         User.findByIdAndRemove.mockImplementationOnce(() => {
//             return {
//             	exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.reject({})
//                 })
//           	}    
//         })
//         const res = await request(app.use(AuthRouter))
//         .delete('/66d71fd54c148fb8f827c2c3')
//         .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
//         .set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`503`)
//     })
//     test("Response has status 404 (user credentials are not in the database)", async () => {
//         mongoose.isValidObjectId.mockImplementationOnce(() => {return true})
//         jwt.verify.mockImplementationOnce(() => {return {
// 			username: 'testowy',
// 			firstName: 'testowy',
// 			userId: '66d71fd54c148fb8f827c2c3',
// 			iat: 1725211851,
// 			exp: 1726211851
// 		}})
//         User.findByIdAndRemove.mockImplementationOnce(() => {
//             return {
//             	exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.resolve(null)
//                 })
//           	}    
//         })
//         const res = await request(app.use(AuthRouter))
//         .delete('/66d71fd54c148fb8f827c2c3')
//         .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
//         .set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`404`)
//     })
//     test("Response has status 200 (user deletion successful)", async () => {
//         mongoose.isValidObjectId.mockImplementationOnce(() => {return true})
//         jwt.verify.mockImplementationOnce(() => {return {
// 			username: 'testowy',
// 			firstName: 'testowy',
// 			userId: '66d71fd54c148fb8f827c2c3',
// 			iat: 1725211851,
// 			exp: 1726211851
// 		}})
//         User.findByIdAndRemove.mockImplementationOnce(() => {
//             return {
//             	exec: jest.fn().mockImplementationOnce(() => {
//                     return Promise.resolve({
//                         _id: "66d71fd54c148fb8f827c2c3",
//                         username: 'testowy',
//                         password: '$2b$10$zv3up3rZKzJv9bY3n8Hvh.dR1UcEoC.bH5obaPm/mxPSDGqZ9vlrO',
//                         firstName: 'testowy',
//                         accountCreationDate: "2024-09-03T14:39:25.536Z",
//                         __v: 0
//                       })
//                 })
//           	}    
//         })
//         const res = await request(app.use(AuthRouter))
//         .delete('/66d71fd54c148fb8f827c2c3')
//         .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
//         .set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

//         expect(res.status).toMatchInlineSnapshot(`200`)
//         expect(res.text).toMatchInlineSnapshot(`"{"_id":"66d71fd54c148fb8f827c2c3","username":"testowy","password":"$2b$10$zv3up3rZKzJv9bY3n8Hvh.dR1UcEoC.bH5obaPm/mxPSDGqZ9vlrO","firstName":"testowy","accountCreationDate":"2024-09-03T14:39:25.536Z","__v":0}"`)
//     })
//     afterEach(() => {
// 		jest.resetAllMocks()
// 	})
// })