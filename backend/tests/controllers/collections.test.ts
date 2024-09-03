import { describe, expect, test, jest, afterEach } from "@jest/globals"
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const CollectionsRouter = require("../../routes/collection")
const request = require("supertest")

const Collection = require("../../models/collection")
jest.mock("../../models/collection", () => ({
	findOne: jest.fn()
}))

describe('getCollection tests', () =>{
    test("Response has status 503 (can't access the database to find the collection)", async () => {
        Collection.findOne.mockImplementationOnce(() => {
        	return {
            	exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
          	}
        })
        const res = await request(app.use(CollectionsRouter))
        .get('/testowa');

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    test("Response has status 404 (collection with provided name doesn't exist)", async () => {
        Collection.findOne.mockImplementationOnce(() => {
        	return {
            	exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(null)})
          	}
        })
        const res = await request(app.use(CollectionsRouter))
        .get('/nieistniejaca');

        expect(res.status).toMatchInlineSnapshot(`404`)
    })
    test("Response has status 200 (get request successful)", async () => {
        Collection.findOne.mockImplementationOnce(() => {
        	return {
            	exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({
                    _id: "66c4e516d6303ed5ac5a8e55",
                    name: 'testowa',
                    description: 'testowa kolekcja',
                    __v: 0
                  })})
          	}
        })
        const res = await request(app.use(CollectionsRouter))
        .get('/testowa');

        expect(res.status).toMatchInlineSnapshot(`200`)
    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})