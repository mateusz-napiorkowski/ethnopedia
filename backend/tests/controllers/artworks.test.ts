import { describe, expect, beforeEach, it, afterEach } from "@jest/globals"
require("dotenv").config()
const mongoose = require('mongoose')
const express = require("express")
const app = express()
const ArtworksRouter = require("../../routes/artwork")
const request = require("supertest")

describe('getArtwork tests', () =>{
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      });
    it("should return status 200 and return artwork data with appropriate artworkId", async () => {
        const res = await request(app.use(ArtworksRouter))
        .get('/662e92b5d628570afa5357c3');
        expect(res.status).toBe(200);
        expect(res.body.artwork._id).toBe("662e92b5d628570afa5357c3")
    })
    it("should return status 400", async () => {
        const res = await request(app.use(ArtworksRouter))
        .get('/123');
        expect(res.status).toBe(400);
    })
    it("should return status 404", async () => {
        const res = await request(app.use(ArtworksRouter))
        .get('/aaaaaaaad628570afa5357c3');
        expect(res.status).toBe(404);
    })
    it("should return status 404", async () => {
        const res = await request(app.use(ArtworksRouter))
        .get('/');
        expect(res.status).toBe(404);
    })
    it("should return status 503", async () => {
        await mongoose.connection.close();
        const res = await request(app.use(ArtworksRouter))
        .get('/662e92b5d628570afa5357c3');
        expect(res.status).toBe(503);
    })
    afterEach(async () => {
        await mongoose.connection.close();
    });
})
