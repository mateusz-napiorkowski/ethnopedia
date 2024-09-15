import { describe, expect, test, jest, beforeEach } from "@jest/globals"
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const ArtworksRouter = require("../../routes/artwork")
const request = require("supertest")

const mockIsValidObjectId = jest.fn()
const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
	isValidObjectId: () => mockIsValidObjectId(),
	startSession: () => mockStartSession()
}))

const mockFindById = jest.fn()
const mockCreate = jest.fn()
const mockReplaceOne = jest.fn()
const mockCount = jest.fn()
const mockDeleteMany = jest.fn()
jest.mock("../../models/artwork", () => ({
	findById: () => mockFindById(),
	create: () => mockCreate(),
	replaceOne: () => mockReplaceOne(),
	count: () => mockCount(),
	deleteMany: () => mockDeleteMany()
}))

const mockFind = jest.fn()
jest.mock("../../models/collection", () => ({
	find: () => mockFind()
}))

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
			mockIsValidObjectId.mockReturnValue(true)
			mockFindById.mockReturnValue({
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
				mockIsValidObjectId.mockReturnValue(isValidObjectId)
				mockFindById.mockReturnValue(findById)

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
			mockCreate.mockReturnValue(Promise.resolve({
				_id: `${artworkId}`,
				categories: [{ name: 'Title', values: [ 'Title' ], subcategories: [] }],
				collectionName: 'collection',
				createdAt: '2024-08-27T17:25:05.352Z',
				updatedAt: '2024-08-27T17:25:05.352Z',
				__v: 0
			}))
			mockFind.mockReturnValue({
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
				mockCreate.mockReturnValue(create)
				mockFind.mockReturnValue(find)

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
			mockReplaceOne.mockReturnValue({
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
				mockReplaceOne.mockReturnValue(replaceOne)

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
			mockStartSession.mockReturnValue(Promise.resolve({
				startTransaction: jest.fn(),
				commitTransaction: jest.fn(),
				abortTransaction: jest.fn(),
				endSession: jest.fn()
			}))
			mockCount.mockReturnValue({
				exec: () => Promise.resolve(2)
			})
			mockDeleteMany.mockReturnValue({
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

		const startSessionDefaultImplementation = () => Promise.resolve({
			startTransaction: jest.fn(),
			commitTransaction: jest.fn(),
			abortTransaction: jest.fn(),
			endSession: jest.fn()
		})
		test.each([
			{payload: {}, startSession: () => {}, count: undefined, deleteMany: undefined, statusCode: 400, error: 'Incorrect request body provided'},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: () => Promise.reject(), count: undefined, deleteMany: undefined, statusCode: 503, error: `Couldn't establish session for database transaction`},
			{payload: { ids: [] },
			startSession: startSessionDefaultImplementation, count: undefined, deleteMany: undefined, statusCode: 400, error: "Artworks not specified"},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: startSessionDefaultImplementation, count: {exec: () => Promise.reject()}, deleteMany: undefined, statusCode: 503, error: "Couldn't complete database transaction"},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: startSessionDefaultImplementation, count: {exec: () => Promise.resolve(2)}, deleteMany: {exec: () => Promise.reject()}, statusCode: 503, error: "Couldn't complete database transaction"},
			{payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
			startSession: startSessionDefaultImplementation, count: {exec: () => Promise.resolve(1)}, deleteMany: undefined, statusCode: 404, error: "Artworks not specified"},
		])(`deleteArtworks should respond with status $statusCode and correct error message`,
			async ({ payload, startSession, count, deleteMany, statusCode, error}) => {
				mockStartSession.mockImplementation(startSession)
				mockCount.mockReturnValue(count)
				mockDeleteMany.mockReturnValue(deleteMany)

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