import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
const Artwork = require("../models/artwork")
import {checkUserIsLoggedIn} from "../utils/auth"
const util = require('util');

export const getArtwork = async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    if (!mongoose.isValidObjectId(artworkId)) {
        const err = new Error(`Invalid artwork id: ${artworkId}`)
        res.status(400)
        return next(err)
    } else {
        try {
            const artwork = await Artwork.findById(artworkId).exec()
            if (!artwork) {
                const err = new Error(`Artwork ${artworkId} not found`)
                res.status(404)
                return next(err)
            } else {
                return res.status(200).json({ artwork })
            }
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503)
            return next(err)
        }
    }   
}

const createArtwork = (async (req: Request, res: Response, next: NextFunction) => {
    const userIsLoggedIn = await checkUserIsLoggedIn(req)
    if (userIsLoggedIn) {
        try {
            const newArtwork = await Artwork.create(req.body).exec()
            return res.status(201).json(newArtwork)
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503)
            return next(err)
        }
    } else {
        const err = new Error('Access denied')
        res.status(401)
        return next(err)
    }
})

const editArtwork = (async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    const userIsLoggedIn = await checkUserIsLoggedIn(req)
    if (userIsLoggedIn) {
        try {
            const editedArtwork = await Artwork.replaceOne({_id: artworkId}, req.body).exec()
            return res.status(201).json(editedArtwork)
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503)
            return next(err)
        }
    } else {
        const err = new Error('Access denied')
        res.status(401)
        return next(err)
    }
})

const deleteArtworks = async (req: Request, res: Response, next: NextFunction) => {
    const userIsLoggedIn = await checkUserIsLoggedIn(req)
    if (userIsLoggedIn) {
        try {
            const artworksToDelete = req.body.ids
            if (Array.isArray(artworksToDelete) && artworksToDelete.length === 0) {
                const err = new Error("Artworks not specified")
                res.status(400)
                return next(err)
            }

            const databaseArtworksToDeleteCounted = await Artwork.count({ _id: { $in: artworksToDelete } }).exec()

            if (databaseArtworksToDeleteCounted !== artworksToDelete.length) {
                const err = new Error("Artworks not found")
                res.status(404)
                return next(err)
            }

            const result = await Artwork.deleteMany({ _id: { $in: artworksToDelete } }).exec()
            return res.status(200).json(result)
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503)
            return next(err)
        }
    } else {
        const err = new Error('Access denied')
        res.status(401)
        return next(err)
    }
}

module.exports = {
    getArtwork,
    createArtwork,
    editArtwork,
    deleteArtworks
}