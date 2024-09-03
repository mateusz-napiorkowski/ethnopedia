import { describe, expect, it, jest, afterEach } from "@jest/globals"
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const AuthRouter = require("../../routes/auth")
const request = require("supertest")

const User = require("../../models/user")
jest.mock("../../models/user", () => ({
	findOne: jest.fn()
}))

describe('registerUser tests', () =>{
    it("Response has status 409", async () => {
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
    it("Response has status 503", async () => {
        User.findOne.mockImplementationOnce(() => {
            return {
            	exec: jest.fn().mockImplementationOnce(() => {
                    return Promise.reject()
                })
          	}    
        })
        const payload = { username: 'istniejaca', firstName: 'istniejaca', password: 'hasl1242o2' }
        const res = await request(app.use(AuthRouter))
        .post('/register')
        .send(payload)
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('loginUser tests', () =>{
    it("test", async () => {

    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('deleteUser tests', () =>{
    it("test", async () => {

    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})