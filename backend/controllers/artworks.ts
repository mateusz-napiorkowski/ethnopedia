import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection";

export const getArtwork = async (req: Request, res: Response) => {
    try {
        const artworkId = req.params.artworkId
        if (!mongoose.isValidObjectId(artworkId))
            throw new Error('Invalid artwork id')
        const artwork = await Artwork.findById(artworkId).exec()
        if (!artwork)
            throw new Error('Artwork not found')
        res.status(200).json({ artwork })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === 'Invalid artwork id')
            res.status(400).json({ error: err.message })
        else if(err.message === 'Artwork not found')
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: 'Database unavailable' })
    }
}

export const createArtwork = authAsyncWrapper((async (req: Request, res: Response) => {
    try {
        const collectionName = req.body.collectionName
        if(!req.body.categories || !collectionName)
            throw new Error(`Incorrect request body provided`)
        const foundCollections = await CollectionCollection.find({name: collectionName}).exec()
        if (foundCollections.length !== 1)
            throw new Error(`Collection not found`)
        const newArtwork = await Artwork.create(req.body)
        res.status(201).json(newArtwork)
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if(err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` });
    }
}))

export const editArtwork = authAsyncWrapper((async (req: Request, res: Response, next: NextFunction) => {
    try {
        const artworkId = req.params.artworkId
        if(!req.body.categories || !req.body.collectionName)
            throw new Error('Incorrect request body provided')
        const editedArtwork = await Artwork.replaceOne({_id: artworkId, collectionName: req.body.collectionName}, req.body).exec()
        if(editedArtwork.modifiedCount === 0) {
            throw new Error('Artwork not found')
        }
        return res.status(201).json(editedArtwork)
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if(err.message === `Artwork not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}))

export const deleteArtworks = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ids = req.body.ids
        if (!ids) {
            throw new Error("Incorrect request body provided")        
        }
    } catch (error: any) {
        console.error(error)
        if (error.message === "Incorrect request body provided") {
            return res.status(400).json({ error: "Incorrect request body provided" });
        }    
    }
    
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
})