import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection";

export const getArtwork = async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    if (!mongoose.isValidObjectId(artworkId)) {
        const err = new Error(`Invalid artwork id: ${artworkId}`)
        res.status(400).json({ error: err.message })
        return next(err)
    }
    try {
        const artwork = await Artwork.findById(artworkId).exec()
        if (!artwork) {
            const err = new Error(`Artwork with id ${artworkId} not found`)      
            res.status(404).json({ error: err.message })
            return next(err)
        }
        return res.status(200).json({ artwork })
    } catch {
        const err = new Error(`Database unavailable`)
        res.status(503).json({ error: err.message })
        return next(err)
    }
     
}

export const createArtwork = authAsyncWrapper((async (req: Request, res: Response, next: NextFunction) => {
    const collectionName = req.body.collectionName
    if(req.body.categories !== undefined && collectionName !== undefined) {
        try {
            const foundCollections = await CollectionCollection.find({name: collectionName}).exec()
            if (foundCollections.length !== 1) {
                const err = new Error(`Collection with name ${collectionName} not found`)
                res.status(404).json({ error: err.message })
                return next(err)
            }
            const newArtwork = await Artwork.create(req.body)
            return res.status(201).json(newArtwork)
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503).json({ error: err.message })
            return next(err)
        }
    }
    const err = new Error(`Incorrect request body provided`)
    res.status(400).json({ error: err.message })
    return next(err)  
}))

export const editArtwork = authAsyncWrapper((async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    if(req.body.categories !== undefined && req.body.collectionName !== undefined) {
        try {
            const editedArtwork = await Artwork.replaceOne({_id: artworkId, collectionName: req.body.collectionName}, req.body).exec()
            if(editedArtwork.modifiedCount === 0) {
                const err = new Error(`Artwork not found`)
                res.status(404).json({ error: err.message })
                return next(err)
            }
            return res.status(201).json(editedArtwork)
        } catch {
            const err = new Error(`Database unavailable`)
            res.status(503).json({ error: err.message })
            return next(err)
        }
    }
    const err = new Error(`Incorrect request body provided`)
    res.status(400).json({ error: err.message })
    return next(err)
}))

export const deleteArtworks = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    if(req.body.ids !== undefined) {
        try {
            const session = await mongoose.startSession()
            try {
                const artworksToDelete = req.body.ids
                if (Array.isArray(artworksToDelete) && artworksToDelete.length === 0) {
                    session.endSession();
                    const err = new Error("Artworks not specified")
                    res.status(400).json({ error: err.message })
                    return next(err)
                }

                session.startTransaction()

                const databaseArtworksToDeleteCounted = await Artwork.count({ _id: { $in: artworksToDelete } }).exec()
                if (databaseArtworksToDeleteCounted !== artworksToDelete.length) {
                    await session.abortTransaction();
                    session.endSession();
                    const err = new Error("Artworks not found")
                    res.status(404).json({ error: err.message })
                    return next(err)
                }
                
                const result = await Artwork.deleteMany({ _id: { $in: artworksToDelete } }, { session }).exec()

                await session.commitTransaction();
                session.endSession();
                return res.status(200).json(result)
            } catch {
                await session.abortTransaction();
                session.endSession();
                const err = new Error(`Couldn't complete database transaction`)
                res.status(503).json({ error: err.message })
                return next(err)
            }
        } catch {
            const err = new Error(`Couldn't establish session for database transaction`)
            res.status(503).json({ error: err.message })
            return next(err)
        } 
    }
    const err = new Error(`Incorrect request body provided`)
    res.status(400).json({ error: err.message })
    return next(err)  
})