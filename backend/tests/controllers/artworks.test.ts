import { describe, expect, it, afterEach, jest, beforeEach } from "@jest/globals"
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const ArtworksRouter = require("../../routes/artwork")
const request = require("supertest")

const mongoose = require('mongoose')
jest.mock('mongoose', () => ({
	isValidObjectId: jest.fn()
}))
const Artwork = require("../../models/artwork")
jest.mock("../../models/artwork", () => ({
	findById: jest.fn(),
	create: jest.fn(),
	replaceOne: jest.fn(),
	count: jest.fn(),
	deleteMany: jest.fn()
}))
const auth = require("../../utils/auth")
jest.mock("../../utils/auth", () => ({
	checkUserIsLoggedIn: jest.fn()
}))

describe('getArtwork tests', () =>{
    it("Response has status 200 and res.body has artwork object with _id parameter", async () => {
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

    it("Response has status 400", async () => {
        mongoose.isValidObjectId.mockImplementationOnce(() => {return false})
        const res = await request(app.use(ArtworksRouter))
        .get('/123');
        expect(res.status).toMatchInlineSnapshot(`400`)
    })

    it("Response has status 404", async () => {
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

    it("Response has status 503", async () => {
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

    afterEach(async () => {
        jest.restoreAllMocks();
    });
})

describe('createArtwork tests', () =>{
	it("Response has status 201", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
		Artwork.create.mockImplementation(() => {
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

	it("Response has status 401", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return false})
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

		expect(res.status).toMatchInlineSnapshot(`401`)
	})

	it("Response has status 503", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
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

	afterEach(async () => {
		jest.restoreAllMocks();
	});
})

describe('editArtwork tests', () =>{
	it("Response has status 201", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
		Artwork.replaceOne.mockImplementation(() => {
			return {
				exec: jest.fn().mockImplementation(() => {return Promise.resolve({
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

	it("Response has status 404", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
		Artwork.replaceOne.mockImplementation(() => {
			return {
				exec: jest.fn().mockImplementation(() => {return Promise.resolve({
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

	it("Response has status 401", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return false})
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

		expect(res.status).toMatchInlineSnapshot(`401`)
	})

	it("Response has status 503", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
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

	afterEach(async () => {
		jest.restoreAllMocks();
	});
})

describe('deleteArtworks tests', () =>{
	it("Response has status 200", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
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

		expect(res.status).toMatchInlineSnapshot(`200`)
		expect(res.text).toMatchInlineSnapshot(`"{"acknowledged":true,"deletedCount":2}"`)
	})

	it("Response has status 401", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return false})
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
		const payload = { 
		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
		}
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`401`)
	})

	it("Response has status 503 (count reject)", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
		Artwork.count.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
			}
		})
		Artwork.deleteMany.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({ acknowledged: true, deletedCount: 2 })})
			}
		})
		const payload = { 
		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
		}
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`503`)
	})

	it("Response has status 503 (deleteMany reject)", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
		Artwork.count.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(2)})
			}
		})
		Artwork.deleteMany.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.reject()})
			}
		})
		const payload = { 
		ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] 
		}
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`503`)
	})
	
	it("Response has status 400", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
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
		const payload = { ids: [ ] }
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`400`)
	})

	it("Response has status 404", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
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
		const payload = { ids: ["662e92a5d628570afa5357bc"] }
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`404`)
	})

	it("Response has status 404 2", async () => {
		auth.checkUserIsLoggedIn.mockImplementationOnce(() => {return true})
		Artwork.count.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve(1)})
			}
		})
		Artwork.deleteMany.mockImplementationOnce(() => {
			return {
				exec: jest.fn().mockImplementationOnce(() => {return Promise.resolve({ acknowledged: true, deletedCount: 2 })})
			}
		})
		const payload = { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ]  }
		const res = await request(app.use(ArtworksRouter))
		.delete('/delete')
		.send(payload)
		.set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
		.set('Content-Type', 'application/json')
		.set('Accept', 'application/json')

		expect(res.status).toMatchInlineSnapshot(`404`)
	})

	afterEach(async () => {
		jest.resetAllMocks();
	});
})