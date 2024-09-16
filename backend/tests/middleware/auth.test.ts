import { NextFunction, Request, Response } from "express"
import { authAsyncWrapper } from "../../middleware/auth"
const request = require("supertest")
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', authAsyncWrapper(async function(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({message: "Callback function has been called"});
}));

const mockVerify = jest.fn()
jest.mock("jsonwebtoken", () => ({
	verify: () => mockVerify()
}))
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
	+ "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
	+ "N-rDSjRS3kApqlA"

describe('auth middleware', () =>{
    beforeEach(() => {
		jest.resetAllMocks()
	})
    test("endpoint should respond with status 400 and correct error message", async () => {
        const res = await request(app)
            .post('/')
            .set('Authorization', `Bearer `)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
        
        expect(res.status).toBe(400)
        expect(res.body.error).toBe("No token provided")
    })
    test("endpoint should respond with status 401 and correct error message", async () => {
        mockVerify.mockImplementation(() => {throw Error()})

        const res = await request(app)
            .post('/')
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
        
        expect(res.status).toBe(401)
        expect(res.body.error).toBe("Access denied")
    })
    test("callback fuction should be called", async () => {
        mockVerify.mockReturnValue(true)

        const res = await request(app)
            .post('/')
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
        
        expect(res.status).toBe(200)
        expect(res.body.message).toBe("Callback function has been called")
    })
})