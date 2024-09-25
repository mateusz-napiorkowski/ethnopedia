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

const mockGetCollectionCategoriesArray = jest.fn()
jest.mock("../../utils/controllers-utils/categories", () => ({
    getCollectionCategoriesArray: () => mockGetCollectionCategoriesArray()
}))

describe('categories controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(CategoriesRouter)
    })

    describe('GET endpoints', () => {
        test("getCollectionCategories should respond with status 200 and correct body", async () => {
            mockFind.mockReturnValue({exec: () => Promise.resolve([
                {
                  _id: "66f3859cfaa74054d286cae8",
                  categories: [ { name: 'Title', values: [ 'An artwork title' ], subcategories: [] } ],
                  collectionName: '1',
                  __v: 0,
                  createdAt: '2024-09-25T03:25:16.376Z',
                  updatedAt: '2024-09-25T03:25:16.376Z'
                }
            ])})
            mockGetCollectionCategoriesArray.mockReturnValue(["Title"])

            const res = await request(app)
                .get(`/all/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test("getCollectionCategories should respond with status 503 and correct error message", async () => {
            mockFind.mockImplementation(() => {throw Error()})

            const res = await request(app)
                .get(`/all/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(503)
            expect(res.body.error).toBe("Database unavailable")
        })
    })
})