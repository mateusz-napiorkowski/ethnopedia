import { describe, expect, test, jest, afterEach } from "@jest/globals"
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const AuthRouter = require("../../routes/auth")
const request = require("supertest")

const User = require("../../models/user")
jest.mock("../../models/user", () => ({
	findOne: jest.fn(),
    create: jest.fn()
}))

const bcrypt = require("bcrypt")
jest.mock("bcrypt", () => ({
	hash: jest.fn(),
    compare: jest.fn()
}))

const jwt = require("jsonwebtoken")
jest.mock("jsonwebtoken", () => ({
	sign: jest.fn()
}))

describe('registerUser tests', () =>{
    test("Response has status 409 (user already exists)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve({
                        _id: "66d4f6b885b045bf982b9499",
                        username: 'istniejaca',
                        password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
                        firstName: 'istniejaca',
                        accountCreationDate: '2024-09-01T23:20:24.293Z',
                        __v: 0
                      })
                })
          	}    
        })
        const payload = { username: 'istniejaca', firstName: 'istniejaca', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/register')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`409`)
    })
    test("Response has status 503 (can't check if given username is already in the database)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.reject()
                })
          	}    
        })
        const payload = { username: 'user', firstName: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/register')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    test("Response has status 500 (password encryption is unsuccessful)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve(null)
                })
          	}    
        })
        bcrypt.hash.mockImplementationOnce((password: String, saltRounds: number, callback: Function) => {
            callback(Error("some error"), 'hasl1242o2')    
        })
        const payload = { username: 'user', firstName: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/register')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`500`)
    })
    test("Response has status 503 (can't add new user to the database)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve(null)
                })
          	}    
        })
        bcrypt.hash.mockImplementationOnce((password: String, saltRounds: number, callback: Function) => {
            callback(undefined, 'hasl1242o2')    
        })
        User.create.mockImplementationOnce(() => {
            return Promise.reject()
        })
        const payload = { username: 'user', firstName: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/register')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    test("Response has status 201 (user registration successful)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve(null)
                })
          	}    
        })
        bcrypt.hash.mockImplementationOnce((password: String, saltRounds: number, callback: Function) => {
            callback(undefined, 'hasl1242o2')    
        })
        User.create.mockImplementationOnce(() => {
            return Promise.resolve({
                username: 'user',
                password: '$2b$10$oYpcXLbpzL7kHK8M3k9SneS6aitfKEjmPw72O9kTXaYscW0QzQ0Ym',
                firstName: 'user',
                _id: "66d72c30c005612ddd8adb73",
                accountCreationDate: "2024-09-03T15:33:04.290Z",
                __v: 0
              })
        })
        jwt.sign.mockImplementationOnce(() => {
            return "eyJhbGciOiJIAzI1NiIsXnR5cCI6IkpXVCJ4.eyJ1c2VybmFtZSI6ImQiLCJmaXJzdE5hbWUiOiJkIiwidXNlcklkIjoiNjZkNzQ5MDNjN2YxYjNiYTJmM2UyMjk3IiwiaWF0IjoxNzI1Mzg0OTYzLCJleHAiOjE3MjYzODQ5NjN9.I6rX0LpWoEyg-TLZEZ4gNW6VgG3OT9nyOq9NeqUnFx8"
        })
        const payload = { username: 'user', firstName: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/register')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`201`)
    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('loginUser tests', () =>{
    test("Response has status 503 (can't check if provided username is already in the database)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.reject()
                })
          	}    
        })
        const payload = { username: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/login')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    test("Response has status 404 (user with provided username doesn't exist)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve(null)
                })
          	}    
        })
        const payload = { username: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/login')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`404`)
    })
    test("Response has status 500 (password comparison unsuccessful)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve({
                        _id: "66d4f6b885b045bf982b9499",
                        username: 'istniejaca',
                        password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
                        firstName: 'istniejaca',
                        accountCreationDate: '2024-09-01T23:20:24.293Z',
                        __v: 0
                      })
                })
              }    
        })
        bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
            callback(Error("some error"), true)    
        })
        const payload = { username: 'user', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/login')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`500`)
    })
    test("Response has status 404 (user with provided username exists but password is incorrect)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve({
                        _id: "66d4f6b885b045bf982b9499",
                        username: 'istniejaca',
                        password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
                        firstName: 'istniejaca',
                        accountCreationDate: '2024-09-01T23:20:24.293Z',
                        __v: 0
                      })
                })
              }    
        })
        bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
            callback(undefined, false)    
        })
        const payload = { username: 'user', password: 'wrongpassword' }
        const res = await request(app.use(AuthRouter))
        .post('/login')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`404`)
    })
    test("Response has status 200 (login successful)", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.resolve({
                        _id: "66d4f6b885b045bf982b9499",
                        username: 'istniejaca',
                        password: '$2b$10$FJQhAc.TOCBIhp0uO4v7VeECPXBDd.hd63jhYBswNAkFvUp5BK1TK',
                        firstName: 'istniejaca',
                        accountCreationDate: '2024-09-01T23:20:24.293Z',
                        __v: 0
                      })
                })
              }    
        })
        bcrypt.compare.mockImplementationOnce((data: String, encrypted: String, callback: Function) => {
            callback(undefined, true)    
        })
        const payload = { username: 'user', password: 'wrongpassword' }
        const res = await request(app.use(AuthRouter))
        .post('/login')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`200`)
    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('deleteUser tests', () =>{
    test("test", async () => {

    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})