import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"

const Artwork = require("../models/artwork")
const Category = require("../models/category")
const jwt = require("jsonwebtoken")

const getArtwork = async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    try {
        if (!mongoose.isValidObjectId(artworkId)) {
            return res.status(400).json(`Invalid artwork id: ${artworkId}`)
        }

        const artwork = await Artwork.findById(artworkId).exec()

        if (!artwork) {
            return res.status(404).json("Artwork not found")
        } else {
            const columnNames = Category.find({ collectionId: artwork.collectionId }).exec()
            return res.status(200).json({ artwork, columnNames })
        }

    } catch (error) {
        next(error)
    }
}

const createArtwork = (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            const newArtwork = await Artwork.create(req.body)
            return res.status(201).json(newArtwork)
        } catch (error) {
            return res.status(401).json({ error: 'Access denied' });
        }
    } catch (error) {
        next(error)
    }
})

const editArtwork = (async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            const editedArtwork = await Artwork.replaceOne({_id: req.params.artworkId}, req.body)
            return res.status(201).json(editedArtwork)
        } catch (error) {
            return res.status(401).json({ error: 'Access denied' });
        }
    } catch (error) {
        next(error)
    }
})

const batchDeleteArtworks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            const artworksToDelete = req.params.artwork
            if (!artworksToDelete) {
                return res.status(400).send({ message: "Artworks not found" })
            }
            const artworksToDeleteList = artworksToDelete.split(",")
            const existingArtworks = await Artwork.find({ _id: { $in: artworksToDeleteList } })

            if (existingArtworks.length === 0) {
                return res.status(404).send({ message: "Artworks not found" })
            }

            const result = await Artwork.deleteMany({ _id: { $in: artworksToDeleteList } })

            res.status(200).json({ message: req.params.artwork, deletedCount: result.deletedCount })
        } catch (error) {
            return res.status(401).json({ error: 'Access denied' });
        }
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getArtwork,
    createArtwork,
    editArtwork,
    batchDeleteArtworks
}