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
	findOne: jest.fn(),
    create: jest.fn()
}))

const jwt = require("jsonwebtoken")
jest.mock("jsonwebtoken", () => ({
	verify: jest.fn()
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

describe('createCollection tests', () =>{
    test("Response has status 400 (no jwt provided)", async () => {
        const payload = { name: 'testowa', description: 'testowa kolekcja' }
        const res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer ')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`400`)
    })
    test("Response has status 401 (jwt invalid)", async () => {
        jwt.verify.mockImplementationOnce(() => {throw new Error()})
        const payload = { name: 'testowa', description: 'testowa kolekcja' }
        const res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer invalidjwt')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`401`)
    })
    test("Response has status 400 (incorrect request body)", async () => {
        jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
        let payload = {}
        let res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`400`)
        
        payload = { name: 'testowa' }
        res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`400`)

        payload = { description: 'testowa kolekcja' }
        res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`400`)
    })
    test("Response has status 503 (can't access database to check if collection already exists)", async () => {
        jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
        Collection.findOne.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
			}
		})
        const payload = { name: 'testowa', description: 'testowa kolekcja' }
        const res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    test("Response has status 409 (collection already exists)", async () => {
        jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
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
        const payload = { name: 'testowa', description: 'testowa kolekcja' }
        const res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`409`)
    })
    test("Response has status 503 (can't access database to create collection)", async () => {
        jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
        Collection.findOne.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(null)})
			}
		})
        Collection.create.mockImplementationOnce(() => { return Promise.reject() })
        const payload = { name: 'testowa', description: 'testowa kolekcja' }
        const res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    test("Response has status 201 (collection creation successful)", async () => {
        jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
        Collection.findOne.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(null)})
			}
		})
        Collection.create.mockImplementationOnce(() => { return Promise.resolve({
            name: 'testowa',
            description: 'testowa kolekcja',
            _id: '66c4e516d6303ed5ac5a8e55',
            __v: 0
          }) })
        const payload = { name: 'testowa', description: 'testowa kolekcja' }
        const res = await request(app.use(CollectionsRouter))
		.post('/create')
		.send(payload)
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
        expect(res.status).toMatchInlineSnapshot(`201`)
        expect(res.text).toMatchInlineSnapshot(`"{"name":"testowa","description":"testowa kolekcja","_id":"66c4e516d6303ed5ac5a8e55","__v":0}"`)
    })
    afterEach(() => {
		jest.resetAllMocks()
	})
})