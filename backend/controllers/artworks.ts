import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"

const asyncWrapper = require("../middleware/async")
const Artwork = require("../models/artwork")
const Collection = require("../models/collection")
const Category = require("../models/category")

const ObjectId = require("mongodb").ObjectId

const getAllArtworks = async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    const totalArtworks = await Artwork.countDocuments({})

    const artworks = await Artwork.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    const columnNames = artworks.length > 0 ? Object.keys(artworks[0].toObject()) : []

    res.status(200).json({
        artworks: artworks,
        total: totalArtworks,
        currentPage: page,
        pageSize: pageSize,
        columnNames: columnNames,
    })
}

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


const patchArtwork = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId
    const updateData = req.body

    if (!mongoose.isValidObjectId(artworkId)) {
        return res.status(400).json({ message: "Invalid artwork ID" })
    }

    try {
        const result = await Artwork.updateOne({ _id: new ObjectId(artworkId) }, { $set: updateData }, { upsert: true })

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: `Artwork with id ${artworkId} not found` })
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: "No changes made to the artwork" })
        }

        const updatedArtwork = await Artwork.findById(artworkId)
        return res.status(200).json(updatedArtwork)
    } catch (error) {
        next(error)
    }
})

const searchArtworks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // let query = JSON.parse(JSON.stringify(req.query))
        // const collection = req.query.collection
        // const searchText = req.query.searchText
        // let query_json: object = {Kolekcja: {value: collection}, $text: { $search: searchText }}
        // const records = await mongoClient.db().collection('artworks').find(query_json).toArray()
        // // const keys = await getAllKeys(collection)
        // // console.log(keys)
        // console.log(records)
        // return res.status(200).json(records)
    } catch (error) {
        next(error)
    }
}

const filterArtworks = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const records = await Artwork.find(req.query).exec()

        return res.json(records)
    } catch (error: any) {
        next(error)
    }
}

const createArtwork = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const title = req.body.title
    const description = req.body.description

    try {
        const newArtwork = await Artwork.create({
            title: title,
            description: description,
        })

        return res.status(201).json(newArtwork)
    } catch (error) {
        next(error)
    }
})

const deleteArtwork = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const artworkId = req.params.artworkId

    try {
        if (!mongoose.isValidObjectId(artworkId)) {
            return res.status(400).json("Invalid artwork id")
        }

        const artwork = await Artwork.findByIdAndRemove(artworkId).exec()

        if (!artwork) {
            return res.status(404).json("Artwork not found")
        }

        return res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

const batchDeleteArtworks = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        next(error)
    }
}

module.exports = {
    getAllArtworks,
    getArtwork,
    createArtwork,
    searchArtworks,
    batchDeleteArtworks,
    filterArtworks,
    patchArtwork,
}