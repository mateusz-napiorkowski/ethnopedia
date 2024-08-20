import { describe, expect, beforeEach, it, afterEach } from "@jest/globals"
require("dotenv").config()
const mongoose = require('mongoose')
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const ArtworksRouter = require("../../routes/artwork")
const request = require("supertest")

describe('getArtwork tests', () =>{
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    });
    it("Response has status 200 and res.body has artwork data with appropriate artworkId", async () => {
        const res = await request(app.use(ArtworksRouter))
        .get('/662e92b5d628570afa5357c3');

        expect(res.status).toMatchInlineSnapshot(`200`)
        expect(res.body.artwork._id).toMatchInlineSnapshot(`"662e92b5d628570afa5357c3"`)
    })
    it("Response has status 400", async () => {
        const res = await request(app.use(ArtworksRouter))
        .get('/123');

        expect(res.status).toMatchInlineSnapshot(`400`)
    })
    it("Response has status 404", async () => {
        let res = await request(app.use(ArtworksRouter))
        .get('/aaaaaaaad628570afa5357c3');

        expect(res.status).toMatchInlineSnapshot(`404`)

        res = await request(app.use(ArtworksRouter))
        .get('/');

        expect(res.status).toMatchInlineSnapshot(`404`)
    })
    it("Response has status 503", async () => {
        await mongoose.connection.close();
        const res = await request(app.use(ArtworksRouter))
        .get('/662e92b5d628570afa5357c3');

        expect(res.status).toMatchInlineSnapshot(`503`)
    })
    afterEach(async () => {
        await mongoose.connection.close();
    });
})

describe('createArtwork tests', () =>{
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    });
    it("Inserts new artwork data to database", async () => {
        const payload = {
            categories: [
              { name: 'Tytuł', values: [ 'created by test' ], subcategories: [] },
              {
                name: 'Artyści',
                values: [ 'Jan Testowy' ],
                subcategories: [ ]
              },
              { name: 'Rok', values: [ '2024' ], subcategories: [] }
            ],
            collectionName: '123'
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
        const payload = {
            categories: [
              { name: 'Tytuł', values: [ 'created by test' ], subcategories: [] },
              {
                name: 'Artyści',
                values: [ 'Jan Testowy' ],
                subcategories: [ ]
              },
              { name: 'Rok', values: [ '2024' ], subcategories: [] }
            ],
            collectionName: '123'
          }
        let res = await request(app.use(ArtworksRouter))
        .post('/create')
        .send(payload)
        .set('Authorization', 'Bearer ')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`401`)

        res = await request(app.use(ArtworksRouter))
        .post('/create')
        .send(payload)
        .set('Authorization', 'Bearer testtokeniJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaeccN-rDSjRS3kApqlA')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')

        expect(res.status).toMatchInlineSnapshot(`401`)

    })
    it("Response has status 503", async () => {
        await mongoose.connection.close();
        const payload = {
            categories: [
              { name: 'Tytuł', values: [ 'created by test' ], subcategories: [] },
              {
                name: 'Artyści',
                values: [ 'Jan Testowy' ],
                subcategories: [ ]
              },
              { name: 'Rok', values: [ '2024' ], subcategories: [] }
            ],
            collectionName: '123'
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
        await mongoose.connection.close();
    });
})
