import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import CategoriesRouter from "../../routes/category";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockFind = jest.fn()
jest.mock("../../models/artwork", () => ({
    find: () => mockFind()
}))

const mockgetAllCategories = jest.fn()
jest.mock("../../utils/categories", () => ({
    getAllCategories: () => mockgetAllCategories()
}))

describe('categories controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(CategoriesRouter)
    })

    describe('GET endpoints', () => {
        test("getCollectionCategories should respond with status 200 and correct body", async () => {
            mockgetAllCategories.mockReturnValue(["Title"])

            const res = await request(app)
                .get(`/all/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test("getCollectionCategories should respond with status 404 and correct error message", async () => {
            mockgetAllCategories.mockImplementation(() => {throw Error("Collection not found")})

            const res = await request(app)
                .get(`/all/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(404)
            expect(res.body.error).toBe("Collection not found")
        })

        test("getCollectionCategories should respond with status 503 and correct error message", async () => {
            mockgetAllCategories.mockImplementation(() => {throw Error("Database unavailable")})

            const res = await request(app)
                .get(`/all/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(503)
            expect(res.body.error).toBe("Database unavailable")
        })
    })
})