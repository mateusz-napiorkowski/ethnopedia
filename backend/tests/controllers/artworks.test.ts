import { describe, expect, test, jest, afterEach } from "@jest/globals"
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

const jwt = require("jsonwebtoken")
jest.mock("jsonwebtoken", () => ({
	verify: jest.fn()
}))

describe('getArtwork tests', () =>{
    test("Response has status 200 and res.body has artwork object with _id parameter (get request successful)", async () => {
		mongoose.isValidObjectId.mockImplementationOnce(() => {return true})
        Artwork.findById.mockImplementationOnce(() => {
        	return {
            	exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({_id: "662e92b5d628570afa5357c3"})})
          	}
        })
        const res = await request(app.use(ArtworksRouter))
        .get('/662e92b5d628570afa5357c3');

        expect(res.status).toMatchInlineSnapshot(`200`)
        expect(res.body.artwork._id).toMatchInlineSnapshot(`"662e92b5d628570afa5357c3"`)
    })

    test("Response has status 400 (artwork ObjectId is invalid)", async () => {
        mongoose.isValidObjectId.mockImplementationOnce(() => {return false})
        const res = await request(app.use(ArtworksRouter))
        .get('/123');

        expect(res.status).toMatchInlineSnapshot(`400`)
    })

    test("Response has status 404 (artwork with given ID doesn't exist)", async () => {
		mongoose.isValidObjectId.mockImplementationOnce(() => {return true})
      	Artwork.findById.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(null)})
			}
      	})
		let res = await request(app.use(ArtworksRouter))
		.get('/aaaaaaaad628570afa5357c3');

		expect(res.status).toMatchInlineSnapshot(`404`)
    })

    test("Response has status 503 (can't access the database to find an artwork)", async () => {
		mongoose.isValidObjectId.mockImplementationOnce(() => {return true})
        Artwork.findById.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
			}
		})
        const res = await request(app.use(ArtworksRouter))
        .get('/662e92b5d628570afa5357c3');

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
	afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('createArtwork tests', () =>{
	test("Response has status 400 (incorrect payload)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		let payload = { }
		let res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)

		payload = {
			categories: [
				{ name: 'Tytuł', values: [ 'Tytuł testowy' ], subcategories: [] },
				{ name: 'Artyści', values: [ 'Jan Testowy' ], subcategories: [] },
				{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			]
		}
		res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)

		payload = {
			collectionName: 'testowa'
		}
		res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)
	})
	test("Response has status 201 (artwork creation successful)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		Artwork.create.mockImplementationOnce(() => {
			return Promise.resolve({
					_id: "66ce0bf156199c1b8df5db7d",
					categories: [
						{ name: 'Tytuł', values: [ 'Tytuł testowy' ], subcategories: [] },
						{ name: 'Artyści', values: [ 'Jan Testowy' ], subcategories: [] },
						{ name: 'Rok', values: [ '2024' ], subcategories: [] }
					],
					collectionName: 'testowa',
					createdAt: '2024-08-27T17:25:05.352Z',
					updatedAt: '2024-08-27T17:25:05.352Z',
					__v: 0
			})
		})
		const payload = {
			categories: [
				{ name: 'Tytuł', values: [ 'Tytuł testowy' ], subcategories: [] },
				{ name: 'Artyści', values: [ 'Jan Testowy' ], subcategories: [] },
				{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		const res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`201`)
	})

	test("Response has status 400 (no jwt provided)", async () => {
		const payload = {
			categories: [
			{ name: 'Tytuł', values: [ 'Tytuł testowy' ], subcategories: [] },
			{ name: 'Artyści', values: [ 'Jan Testowy' ], subcategories: [ ] },
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		let res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer ')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)
	})

	test("Response has status 401 (jwt invalid)", async () => {
		jwt.verify.mockImplementationOnce(() => {throw new Error()})
		const payload = {
			categories: [
			{ name: 'Tytuł', values: [ 'Tytuł testowy' ], subcategories: [] },
			{ name: 'Artyści', values: [ 'Jan Testowy' ], subcategories: [ ] },
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		let res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer invalidtoken')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`401`)
	})

	test("Response has status 503 (can't access database to add new artwork)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		Artwork.create.mockImplementationOnce(() => { return Promise.reject() })
		const payload = {
		categories: [
			{ name: 'Tytuł', values: [ 'Tytuł testowy' ], subcategories: [] },
			{ name: 'Artyści', values: [ 'Jan Testowy' ], subcategories: [ ] },
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
		],
		collectionName: 'testowa'
		}
		const res = await request(app.use(ArtworksRouter))
		.post('/create')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		
		expect(res.status).toMatchInlineSnapshot(`503`)
	})
	afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('editArtwork tests', () =>{
	test("Response has status 400 (incorrect payload)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		let payload = { }
		let res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)
		
		payload = {
			categories: [
				{ name: 'Tytuł', values: [ 'Tytuł zamieniony' ], subcategories: [] },
				{
					name: 'Artyści',
					values: [ 'Jan Zamieniony' ],
					subcategories: [ ]
				},
				{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			]
		}
		res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)

		payload = {
			collectionName: 'testowa'
		}
		res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)
	})
	test("Response has status 201 (request successful)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		Artwork.replaceOne.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({
					acknowledged: true,
					modifiedCount: 1,
					upsertedId: null,
					upsertedCount: 0,
					matchedCount: 1
				})})
			}
		})
		const payload = {
			categories: [
			{ name: 'Tytuł', values: [ 'Tytuł zamieniony' ], subcategories: [] },
			{
				name: 'Artyści',
				values: [ 'Jan Zamieniony' ],
				subcategories: [ ]
			},
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		const res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`201`)
		expect(res.text).toMatchInlineSnapshot(`"{"acknowledged":true,"modifiedCount":1,"upsertedId":null,"upsertedCount":0,"matchedCount":1}"`)
	})

	test("Response has status 404 (artwork with given ID doesn't exist)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		Artwork.replaceOne.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({
					acknowledged: true,
					modifiedCount: 0,
					upsertedId: null,
					upsertedCount: 0,
					matchedCount: 0
				})})
			}
		})
		const payload = {
			categories: [
			{ name: 'Tytuł', values: [ 'Tytuł zamieniony' ], subcategories: [] },
			{
				name: 'Artyści',
				values: [ 'Jan Zamieniony' ],
				subcategories: [ ]
			},
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		const res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`404`)
	})

	test("Response has status 400 (no jwt provided)", async () => {
		const payload = {
			categories: [
			{ name: 'Tytuł', values: [ 'Tytuł zamieniony' ], subcategories: [] },
			{
				name: 'Artyści',
				values: [ 'Jan Zamieniony' ],
				subcategories: [ ]
			},
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		let res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer ')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)
	})

	test("Response has status 401 (invalid jwt)", async () => {
		jwt.verify.mockImplementationOnce(() => {throw new Error()})
		const payload = {
			categories: [
			{ name: 'Tytuł', values: [ 'Tytuł zamieniony' ], subcategories: [] },
			{
				name: 'Artyści',
				values: [ 'Jan Zamieniony' ],
				subcategories: [ ]
			},
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
			],
			collectionName: 'testowa'
		}
		let res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer invalidtoken')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`401`)
	})

	test("Response has status 503 (can't access database to edit artwork)", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		Artwork.replaceOne.mockImplementationOnce(() => {
		return {
			exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
		}
		})
		const payload = {
		categories: [
			{ name: 'Tytuł', values: [ 'Tytuł zamieniony' ], subcategories: [] },
			{
			name: 'Artyści',
			values: [ 'Jan Zamieniony' ],
			subcategories: [ ]
			},
			{ name: 'Rok', values: [ '2024' ], subcategories: [] }
		],
		collectionName: 'testowa'
	}
		const res = await request(app.use(ArtworksRouter))
		.put('/edit/66ce0bf156199c1b8df5db7d')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`503`)
	})
	afterEach(() => {
		jest.resetAllMocks()
	})
})

describe('Test deleteArtworks.', () => {
	test("Incorrect payload", async () => {
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		const payload: any = { }
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(jwt.verify).toMatchSnapshot("Authorization is successful (jwt.verify is called and returns decoded user data)")
		expect(res.status).toMatchSnapshot("Status code equals 400")
		expect(payload.ids).toMatchSnapshot("Payload is incorrect (req.body.ids is undefined)")
		// expect(mongoose.startSession.mock.calls).toMatchSnapshot("startSession is not called")
		// expect(Artwork.count.mock.calls).toMatchSnapshot("Artwork.count is not called")
		// expect(Artwork.deleteMany.mock.calls).toMatchSnapshot("Artwork.deleteMany is not called")
	})

	test("Artwork deletion successful", async () => {
		mongoose.startSession.mockImplementationOnce(() => {return Promise.resolve({
			startTransaction: jest.fn(),
			commitTransaction: jest.fn(),
			abortTransaction: jest.fn(),
			endSession: jest.fn()
		})})
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		Artwork.count.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(2)})
			}
		})
		Artwork.deleteMany.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({ acknowledged: true, deletedCount: 2 })})
			}
		})
		const payload = { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(jwt.verify).toMatchSnapshot("Authorization is successful (jwt.verify is called and returns decoded user data)")
		// expect(res.status).toMatchSnapshot("Status code equals 200")
		expect(res.text).toMatchSnapshot()
		expect(mongoose.startSession).toMatchSnapshot("startSession is called once")
		expect(await mongoose.startSession.mock.results[0].value).toMatchSnapshot("startTransaction, commitTransaction, endSession are called once")
		expect(Artwork.count.mock.calls).toMatchSnapshot("Artwork.count is called once, has right filter and is part of the transaction")
		expect(Artwork.deleteMany.mock.calls).toMatchSnapshot("Artwork.deleteMany is called once, has right filter and is part of the transaction")
	})

	test("No jwt provided", async () => {
		jwt.verify.mockImplementationOnce(() => {throw new Error()})
		const payload = { 
		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
		}
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer ')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(jwt.verify.mock.calls).toMatchSnapshot("Authorization is unsuccessful (jwt.verify is not called)")
		expect(res.status).toMatchSnapshot(`Status code equals 400`)
		// expect(mongoose.startSession.mock.calls).toMatchSnapshot("startSession is not called")
		// expect(Artwork.count.mock.calls).toMatchSnapshot("Artwork.count is not called")
		// expect(Artwork.deleteMany.mock.calls).toMatchSnapshot("Artwork.deleteMany is not called")
	})

	test("Invalid jwt", async () => {
		jwt.verify.mockImplementationOnce(() => {throw new Error()})
		const payload = { 
		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
		}
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(jwt.verify).toMatchSnapshot("Authorization is unsuccessful (jwt.verify is called with wrong token and throws an error)")
		expect(res.status).toMatchSnapshot(`Status code equals 401`)
		// expect(mongoose.startSession.mock.calls).toMatchSnapshot("startSession is not called")
		// expect(Artwork.count.mock.calls).toMatchSnapshot("Artwork.count is not called")
		// expect(Artwork.deleteMany.mock.calls).toMatchSnapshot("Artwork.deleteMany is not called")
	})

	test("Couldn't establish session for database transaction", async () => {
		mongoose.startSession.mockRejectedValue(new Error("example mongoose.startSession Error"))
		jwt.verify.mockImplementationOnce(() => {return {
			username: 'testowy',
			firstName: 'testowy',
			userId: '12b2343fbb64df643e8a9ce6',
			iat: 1725211851,
			exp: 1726211851
		}})
		const payload = { 
		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
		}
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')
		expect(jwt.verify).toMatchSnapshot("Authorization is successful (jwt.verify is called and returns decoded user data)")
		expect(res.status).toMatchSnapshot(`Status code equals 503`)
		expect(await mongoose.startSession).rejects.toMatchSnapshot("Session for database transaction is not established (mongoose.startSession throws an error)")
	})

	// test("Response has status 503 (can't count artworks to be deleted in the database)", async () => {
	// 	mongoose.startSession.mockImplementationOnce(() => {return Promise.resolve({
	// 		startTransaction: jest.fn(),
	// 		commitTransaction: jest.fn(),
	// 		abortTransaction: jest.fn(),
	// 		endSession: jest.fn()
	// 	})})
	// 	jwt.verify.mockImplementationOnce(() => {return {
	// 		username: 'testowy',
	// 		firstName: 'testowy',
	// 		userId: '12b2343fbb64df643e8a9ce6',
	// 		iat: 1725211851,
	// 		exp: 1726211851
	// 	}})
	// 	Artwork.count.mockImplementationOnce(() => {
	// 		return {
	// 			exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
	// 		}
	// 	})
	// 	const payload = { 
	// 	ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
	// 	}
	// 	const res = await request(app.use(ArtworksRouter))
	// 	.delete('/delete')
	// 	.send(payload)
	// 	.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
	// 	.set('Content-Type', 'application/json')
	// 	.set('Accept', 'application/json')

	// 	expect(jwt.verify).toMatchSnapshot("Authorization is successful (jwt.verify is called and returns decoded user data)")
	// 	expect(res.status).toMatchInlineSnapshot(`503`)
	// 	expect(res.status).toMatchSnapshot(`Status code equals 503`)
	// })

	// test("Response has status 503 (can't delete artworks from the database)", async () => {
	// 	jwt.verify.mockImplementationOnce(() => {return {
	// 		username: 'testowy',
	// 		firstName: 'testowy',
	// 		userId: '12b2343fbb64df643e8a9ce6',
	// 		iat: 1725211851,
	// 		exp: 1726211851
	// 	}})
	// 	Artwork.count.mockImplementationOnce(() => {
	// 		return {
	// 			exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(2)})
	// 		}
	// 	})
	// 	Artwork.deleteMany.mockImplementationOnce(() => {
	// 		return {
	// 			exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
	// 		}
	// 	})
	// 	const payload = { 
	// 	ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
	// 	}
	// 	const res = await request(app.use(ArtworksRouter))
	// 	.delete('/delete')
	// 	.send(payload)
	// 	.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
	// 	.set('Content-Type', 'application/json')
	// 	.set('Accept', 'application/json')

	// 	expect(res.status).toMatchInlineSnapshot(`503`)
	// })
	
	// test("Response has status 400 (artworks to be deleted not specified)", async () => {
	// 	jwt.verify.mockImplementationOnce(() => {return {
	// 		username: 'testowy',
	// 		firstName: 'testowy',
	// 		userId: '12b2343fbb64df643e8a9ce6',
	// 		iat: 1725211851,
	// 		exp: 1726211851
	// 	}})
	// 	const payload = { ids: [ ] }
	// 	const res = await request(app.use(ArtworksRouter))
	// 	.delete('/delete')
	// 	.send(payload)
	// 	.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
	// 	.set('Content-Type', 'application/json')
	// 	.set('Accept', 'application/json')

	// 	expect(res.status).toMatchInlineSnapshot(`400`)
	// })

	// test("Response has status 404 (artworks with provided ids don't exist)", async () => {
	// 	jwt.verify.mockImplementationOnce(() => {return {
	// 		username: 'testowy',
	// 		firstName: 'testowy',
	// 		userId: '12b2343fbb64df643e8a9ce6',
	// 		iat: 1725211851,
	// 		exp: 1726211851
	// 	}})
	// 	Artwork.count.mockImplementationOnce(() => {
	// 		return {
	// 			exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(2)})
	// 		}
	// 	})
	// 	const payload = { ids: ["662e92a5d628570afa5357bc"] }
	// 	const res = await request(app.use(ArtworksRouter))
	// 	.delete('/delete')
	// 	.send(payload)
	// 	.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
	// 	.set('Content-Type', 'application/json')
	// 	.set('Accept', 'application/json')

	// 	expect(res.status).toMatchInlineSnapshot(`404`)
	// })

	// test("Response has status 404 (didn't find all artworks to be deleted in the database)", async () => {
	// 	jwt.verify.mockImplementationOnce(() => {return {
	// 		username: 'testowy',
	// 		firstName: 'testowy',
	// 		userId: '12b2343fbb64df643e8a9ce6',
	// 		iat: 1725211851,
	// 		exp: 1726211851
	// 	}})
	// 	Artwork.count.mockImplementationOnce(() => {
	// 		return {
	// 			exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(1)})
	// 		}
	// 	})
	// 	const payload = { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ]  }
	// 	const res = await request(app.use(ArtworksRouter))
	// 	.delete('/delete')
	// 	.send(payload)
	// 	.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
	// 	.set('Content-Type', 'application/json')
	// 	.set('Accept', 'application/json')

	// 	expect(res.status).toMatchInlineSnapshot(`404`)
	// })
	afterEach(() => {
		jest.resetAllMocks()
	})
})