import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
const Artwork = require("../models/artwork")

import { authAsyncWrapper } from "../middleware/auth"

export const getArtwork = async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    if (!mongoose.isValidObjectId(artworkId)) {
        const err = new Error(`Invalid artwork id: ${artworkId}`)
        res.status(400).json({ error: err.message })
        return next(err)
    } else {
        try {
            const artwork = await Artwork.findById(artworkId).exec()
            if (!artwork) {
                const err = new Error(`Artwork with id ${artworkId} not found`)      
                res.status(404).json({ error: err.message })
                return next(err)
            } else {
                return res.status(200).json({ artwork })
            }
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503).json({ error: err.message })
            return next(err)
        }
    }   
}

const createArtwork = authAsyncWrapper((async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.categories !== undefined && req.body.collectionName !== undefined) {
        try {
            const newArtwork = await Artwork.create(req.body)
            return res.status(201).json(newArtwork)
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503)
            return next(err)
        }
    } else {
        const err = new Error(`Incorrect request body provided`)
        res.status(400)
        return next(err)
    }
    
}))

const editArtwork = authAsyncWrapper((async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    if(req.body.categories !== undefined && req.body.collectionName !== undefined) {
        try {
            const editedArtwork = await Artwork.replaceOne({_id: artworkId}, req.body).exec()
            if(editedArtwork.modifiedCount === 0) {
                const err = new Error(`Artwork not found`)
                res.status(404)
                return next(err)
            } else {
                return res.status(201).json(editedArtwork)
            }
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503)
            return next(err)
        }
    } else {
        const err = new Error(`Incorrect request body provided`)
        res.status(400)
        return next(err)
    }
}))

const deleteArtworks = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.ids !== undefined) {
        try{
            const session = await mongoose.startSession()
            try {
                const artworksToDelete = req.body.ids
                if (Array.isArray(artworksToDelete) && artworksToDelete.length === 0) {
                    session.endSession();
                    res.status(400)
                    return next(Error("Artworks not specified"))
                }
                session.startTransaction()
                const databaseArtworksToDeleteCounted = await Artwork.count({ _id: { $in: artworksToDelete } }, { session }).exec()
                if (databaseArtworksToDeleteCounted !== artworksToDelete.length) {
                    await session.abortTransaction();
                    session.endSession();
                    res.status(404).json("Artworks not found")
                    return next(Error("Artworks not found"))
                }
        
                const result = await Artwork.deleteMany({ _id: { $in: artworksToDelete } }, { session }).exec()
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json(result)
            } catch {
                await session.abortTransaction();
                session.endSession();
                res.status(503)
                return next(Error(`Couldn't complete database transaction`))
            }
        } catch {
            res.status(503)
            return next(Error(`Couldn't establish session for database transaction`))
        } 
    } else {
        res.status(400)
        return next(Error(`Incorrect request body provided`))
    }
    
})

module.exports = {
    getArtwork,
    createArtwork,
    editArtwork,
    deleteArtworks
}