import { describe, expect, test, jest, beforeEach } from "@jest/globals"
import { startSession } from "mongoose";
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const ArtworksRouter = require("../../routes/artwork")
const request = require("supertest")

const mongoose = require('mongoose')
jest.mock('mongoose', () => ({
	isValidObjectId: jest.fn(),
	startSession: jest.fn()
}))

const Artwork = require("../../models/artwork")
jest.mock("../../models/artwork", () => ({
	findById: jest.fn(),
	create: jest.fn(),
	replaceOne: jest.fn(),
	count: jest.fn(),
	deleteMany: jest.fn()
}))

const Collection = require("../../models/collection")
jest.mock("../../models/collection", () => ({
	find: jest.fn()
}))

const jwt = require("jsonwebtoken")
jest.mock("jsonwebtoken", () => ({
	verify: jest.fn()
}))
const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
	+ "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
	+ "N-rDSjRS3kApqlA"

describe('Artworks controller', () =>{
	beforeEach(() => {
		jest.resetAllMocks()
	})
	
	describe('GET endpoints', () => {	
		test("getArtwork should respond with status 200 and correct body", async () => {
			const artworkId = "662e92b5d628570afa5357c3"
			mongoose.isValidObjectId.mockReturnValue(true)
			Artwork.findById.mockReturnValue({
				exec: jest.fn().mockReturnValue( Promise.resolve({
					_id: `${artworkId}`,
					categories: [{ name: 'Title', values: ["Title"], subcategories: [] }],
					collectionName: 'collection',
					createdAt: new Date("2024-09-10T12:17:12.821Z"),
						updatedAt: new Date("2024-09-10T12:17:12.821Z"),
					__v: 0
				}))
			})
		
			const res = await request(app.use(ArtworksRouter))
				.get(`/${artworkId}`)
				.set('Accept', 'application/json')
	
			expect(res.status).toBe(200)
			expect(res.body).toMatchSnapshot({artwork: {
				_id: `${artworkId}`,
				categories: expect.any(Array),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				collectionName: expect.any(String),
				__v: expect.any(Number)
			}})
		})

		test.each([
			{isValidObjectId: false, findById: undefined, artworkId: '123',
				statusCode: 400, error: 'Invalid artwork id: 123'},
			{isValidObjectId: true, findById: { exec: () => Promise.resolve(null) }, artworkId: 'aaaaaaaad628570afa5357c3',
				statusCode: 404, error: "Artwork with id aaaaaaaad628570afa5357c3 not found"},
			{isValidObjectId: true, findById: { exec: () => Promise.reject() }, artworkId: 'aaaaaaaad628570afa5357c3',
				statusCode: 503, error: "Database unavailable"}, 
		])(`getArtwork should respond with status $statusCode and correct error message`,
			async ({ isValidObjectId, findById, artworkId, statusCode, error}) => {
				mongoose.isValidObjectId.mockReturnValue(isValidObjectId)
				Artwork.findById.mockReturnValue(findById)

				const res = await request(app.use(ArtworksRouter))
					.get(`/${artworkId}`)
					.set('Accept', 'application/json')

				expect(res.status).toBe(statusCode)
				expect(res.body.error).toBe(error)
			}
		)
	})

	describe('POST endpoints', () => {
		const artworkId = "66ce0bf156199c1b8df5db7d"
		const collectionId = "66c4e516d6303ed5ac5a8e55"
		test("createArtwork should respond with status 201 and correct body", async () => {
			Artwork.create.mockReturnValue(Promise.resolve({
				_id: `${artworkId}`,
				categories: [{ name: 'Title', values: [ 'Title' ], subcategories: [] }],
				collectionName: 'collection',
				createdAt: '2024-08-27T17:25:05.352Z',
				updatedAt: '2024-08-27T17:25:05.352Z',
				__v: 0
			}))
			Collection.find.mockReturnValue({
				exec: () => Promise.resolve([{
					_id: `${collectionId}`,
					name: 'collection',
					description: 'collection description',
					__v: 0
				}])
			})
			const payload = {
				categories: [{ name: 'Title', values: [ 'Title' ], subcategories: []}],
				collectionName: 'collection'
			}

			const res = await request(app.use(ArtworksRouter))
				.post('/create')
				.send(payload)
				.set('Authorization', `Bearer ${jwtToken}`)
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
	
			expect(res.status).toBe(201)
			expect(res.body).toMatchSnapshot({
				_id: `${artworkId}`,
				categories: expect.any(Array),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				collectionName: expect.any(String),
				__v: expect.any(Number)
			})
		})

		test.each([
			{payload: {},
				create: undefined, find: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: { categories: [ { name: 'Title', values: [ 'Title' ], subcategories: [] } ]},
				create: undefined, find: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: { collectionName: 'collection' },
				create: undefined, find: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: { categories: [{ name: 'Title', values: [ 'Title' ], subcategories: [] }], collectionName: 'collection'},
				create: undefined, find: {exec: () => Promise.reject()}, statusCode: 503, error: 'Database unavailable'},
			{payload: { categories: [{ name: 'Title', values: [ 'Title' ], subcategories: [] }], collectionName: 'collection'},
				create: () => Promise.reject(), find: undefined, statusCode: 503, error: 'Database unavailable'},
			{payload: { categories: [{ name: 'Title', values: [ 'Title' ], subcategories: [] }], collectionName: 'collection'},
				create: undefined, find: {exec: () => Promise.resolve([])}, statusCode: 404, error: "Collection with name collection not found"}
		])(`createArtwork should respond with status $statusCode and correct error message`, async ({
			payload, create, find, statusCode, error}) => {
				Artwork.create.mockReturnValue(create)
				Collection.find.mockReturnValue(find)

				const res = await request(app.use(ArtworksRouter))
					.post('/create')
					.send(payload)
					.set('Authorization', `Bearer ${jwtToken}`)
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')

				expect(res.status).toBe(statusCode)
				expect(res.body.error).toBe(error)
			}
		)
	})

	describe('PUT endpoints', () => {
		test("editArtwork should respond with status 201 and correct body", async () => {
			Artwork.replaceOne.mockReturnValue({
				exec: () => Promise.resolve({
					acknowledged: true,
					modifiedCount: 1,
					upsertedId: null,
					upsertedCount: 0,
					matchedCount: 1
				})
			})
			const payload = {
				categories: [{ name: 'Title', values: [ 'New Title' ], subcategories: [] }],
				collectionName: 'collection'
			}

			const res = await request(app.use(ArtworksRouter))
				.put('/edit/66ce0bf156199c1b8df5db7d')
				.send(payload)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
	
			expect(res.status).toBe(201)
			expect(res.body).toMatchSnapshot({
				acknowledged: true,
				modifiedCount: 1,
				upsertedId: null,
				upsertedCount: 0,
				matchedCount: 1
			})
		})

		test.each([
			{payload: {},
				replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: {categories: [{ name: 'Title', values: [ 'New Title' ], subcategories: [] }]},
				replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: {collectionName: 'collection'},
				replaceOne: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: {categories: [{ name: 'Title', values: [ 'New Title' ], subcategories: [] }], collectionName: 'collection'},
				replaceOne: {exec: () => Promise.reject()}, statusCode: 503, error: 'Database unavailable'},
			{payload: {categories: [{ name: 'Title', values: [ 'New Title' ], subcategories: [] }], collectionName: 'collection'},
				replaceOne: {exec: () => Promise.resolve({
					acknowledged: true,
					modifiedCount: 0,
					upsertedId: null,
					upsertedCount: 0,
					matchedCount: 0
				})}, 
				statusCode: 404, error: 'Artwork not found'},

				
		])(`editArtwork should respond with status $statusCode and correct error message`, async ({
			payload, replaceOne, statusCode, error}) => {
				Artwork.replaceOne.mockReturnValue(replaceOne)

				const res = await request(app.use(ArtworksRouter))
				.put('/edit/66ce0bf156199c1b8df5db7d')
				.send(payload)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')

				expect(res.status).toBe(statusCode)
				expect(res.body.error).toBe(error)
			}
		)
	})

	describe('DELETE endpoints', () => {
		test("deleteArtworks should respond with status 200 and correct body", async () => {
			mongoose.startSession.mockReturnValue(Promise.resolve({
				startTransaction: jest.fn(),
				commitTransaction: jest.fn(),
				abortTransaction: jest.fn(),
				endSession: jest.fn()
			}))
			Artwork.count.mockReturnValue({
				exec: () => Promise.resolve(2)
			})
			Artwork.deleteMany.mockReturnValue({
				exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })
			})
			const payload = { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }

			const res = await request(app.use(ArtworksRouter))
			.delete('/delete')
			.send(payload)
			.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
	
			expect(res.status).toBe(200)
			expect(res.body).toMatchSnapshot({
				"acknowledged": true,
				"deletedCount": 2,
			})
		})

		const startSessionDefault = () => Promise.resolve({
			startTransaction: jest.fn(),
			commitTransaction: jest.fn(),
			abortTransaction: jest.fn(),
			endSession: jest.fn()
		})
		test.each([
			{payload: {}, startSession: undefined, count: undefined, deleteMany: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: () => Promise.reject(), count: undefined, deleteMany: undefined, statusCode: 503, error: `Couldn't establish session for database transaction`},
			{payload: { ids: [] },
			startSession: startSessionDefault, count: undefined, deleteMany: undefined, statusCode: 400, error: "Artworks not specified"},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: startSessionDefault, count: {exec: () => Promise.reject()}, deleteMany: undefined, statusCode: 503, error: "Couldn't complete database transaction"},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: startSessionDefault, count: {exec: () => Promise.resolve(2)}, deleteMany: {exec: () => Promise.reject()}, statusCode: 503, error: "Couldn't complete database transaction"},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: startSessionDefault, count: {exec: () => Promise.resolve(1)}, deleteMany: undefined, statusCode: 404, error: "Artworks not specified"},
		])(`deleteArtworks should respond with status $statusCode and correct error message`,
			async ({ payload, startSession, count, deleteMany, statusCode, error}) => {
				mongoose.startSession.mockImplementationOnce(startSession)
				Artwork.count.mockReturnValue(count)
				Artwork.deleteMany.mockReturnValue(deleteMany)

				const res = await request(app.use(ArtworksRouter))
				.delete('/delete')
				.send(payload)
				.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
				.set('Content-Type', 'application/json')
				.set('Accept', 'application/json')
		
				expect(res.status).toBe(statusCode)
				expect(res.body.error).toBe(error)
			}
		)
	})
})

// 	test("No jwt provided", async () => {
// 		jwt.verify.mockImplementationOnce(() => {throw new Error()})
// 		const payload = { 
// 		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
// 		}
// 		const res = await request(app.use(ArtworksRouter))
// 		.delete('/delete')
// 		.send(payload)
// 		.set('Authorization', 'Bearer ')
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

// 		expect(jwt.verify.mock.calls).toMatchSnapshot("Authorization is unsuccessful (jwt.verify is not called)")
// 		expect(res.status).toMatchSnapshot(`Status code equals 400`)
// 		// expect(mongoose.startSession.mock.calls).toMatchSnapshot("startSession is not called")
// 		// expect(Artwork.count.mock.calls).toMatchSnapshot("Artwork.count is not called")
// 		// expect(Artwork.deleteMany.mock.calls).toMatchSnapshot("Artwork.deleteMany is not called")
// 	})

// 	test("Invalid jwt", async () => {
// 		jwt.verify.mockImplementationOnce(() => {throw new Error()})
// 		const payload = { 
// 		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
// 		}
// 		const res = await request(app.use(ArtworksRouter))
// 		.delete('/delete')
// 		.send(payload)
// 		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
// 		.set('Content-Type', 'application/json')
// 		.set('Accept', 'application/json')

// 		expect(jwt.verify).toMatchSnapshot("Authorization is unsuccessful (jwt.verify is called with wrong token and throws an error)")
// 		expect(res.status).toMatchSnapshot(`Status code equals 401`)
// 		// expect(mongoose.startSession.mock.calls).toMatchSnapshot("startSession is not called")
// 		// expect(Artwork.count.mock.calls).toMatchSnapshot("Artwork.count is not called")
// 		// expect(Artwork.deleteMany.mock.calls).toMatchSnapshot("Artwork.deleteMany is not called")
// 	})