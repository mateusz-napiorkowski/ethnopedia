import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import DataExportRouter from "../../routes/dataExport";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockGetAllCategories = jest.fn()
const mockFillRow = jest.fn()
jest.mock("../../utils/controllers-utils/data-export", () => ({
    getAllCategories: () => mockGetAllCategories(),
    fillRow: () => mockFillRow()
}))

const mockFind = jest.fn()
jest.mock("../../models/artwork", () => ({
    find: () => mockFind()
}))

describe('data-import controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(DataExportRouter)
    })
    describe('GET endpoints', () => {
        test("getXlsxWithCollectionData should respond with status 201 and correct body", async () => {
            mockGetAllCategories.mockReturnValue([ 'Title' ])
            mockFind.mockReturnValue({exec: () => Promise.resolve([
                {
                    _id: "66f3829cfaa77054d286dbe8",
                    categories: [ { name: 'Title', values: [ 'An artwork title' ], subcategories: [] } ],
                    collectionName: 'collection',
                    __v: 0,
                    createdAt: '2024-09-25T03:25:16.376Z',
                    updatedAt: '2024-09-25T03:25:16.376Z'
                  }
              ])})
            mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })

            const res = await request(app)
                .get(`/collection/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                statusCode: 500, error: 'Error preparing data for xlsx file',
                getAllCategories: () => {throw new Error("Error preparing data for xlsx file")},
                find: () => {},
                fillRow: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                getAllCategories: () => [ 'Title' ],
                find: () => {throw new Error()},
                fillRow: () => {}
            },
            {
                statusCode: 500, error: 'Error preparing data for xlsx file',
                getAllCategories: () => {throw new Error("Error preparing data for xlsx file")},
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66f3829cfaa77054d286dbe8",
                        categories: [ { name: 'Title', values: [ 'An artwork title' ], subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                      }
                  ])}},
                fillRow: () => {throw new Error("Error preparing data for xlsx file")}
            },
        ])(`getXlsxWithCollectionData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, getAllCategories, find, fillRow}) => {
                    mockGetAllCategories.mockImplementation(getAllCategories)
                    mockFind.mockImplementation(find)
                    mockFillRow.mockImplementation(fillRow)

                    const res = await request(app)
                    .get(`/collection/collection`)
                    .set('Accept', 'application/json')

    
                    expect(res.status).toBe(statusCode)
                    expect(res.body.error).toBe(error)
                }
            )
    })
})