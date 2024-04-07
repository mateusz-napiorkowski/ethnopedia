import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { ObjectId } from "mongodb"

const Collection = require("../models/collection")
const Category = require("../models/collection")
const Artwork = require("../models/artwork")
const asyncWrapper = require("../middleware/async")

const getAllCollections = async (req: Request, res: Response, next: any) => {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    const collections = await Collection.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    const categories = await Category.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    const totalCollections = await Collection.countDocuments({})

    const pipeline = [
        {
            $match: { "collectionName": { $exists: true } },
        },
        {
            $group: {
                _id: "$collectionName",
                count: { $sum: 1 },
            },
        },
    ]

    const artworks = await Artwork.aggregate(pipeline)
    let artworkMap = new Map()

    artworks.forEach((artwork: any) => {
        artworkMap.set(artwork._id, artwork.count)
    })

    let combinedData = new Map()

    collections.forEach((collection: any) => {
        combinedData.set(collection._id, {
            id: collection._id,
            name: collection.name,
            description: collection.description,
            artworksCount: artworkMap.get(collection.name) || 0,
            categoriesCount: 17,
        })
    })

    let combinedArray = Array.from(combinedData.values())

    res.status(200).json({
        collections: combinedArray,
        total: totalCollections,
        currentPage: page,
        pageSize: pageSize,
    })
}

function countLabelsRecursively(categoryDetails: any) {
    let count = 0
    const recurse = (details: any) => {
        if (details)
            details.forEach((detail: any) => {
                count++
                if (detail.subcategories) {
                    recurse(detail.subcategories)
                }
            })
    }
    recurse(categoryDetails)
    return count
}

const artworksInCollection = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const pageSize = parseInt(req.query.pageSize as string) || 10
        const totalArtworks = await Artwork.countDocuments({ collectionName: req.params.name })
        
        if(req.query.searchText!==undefined) {
            // quicksearch
        }
        
        const records = await Artwork.find({ collectionName: req.params.name })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec()

        return res.json({
            artworks: records,
            total: totalArtworks,
            currentPage: page,
            pageSize: pageSize,
        })
    } catch (error: any) {
        next(error)
    }
}

const getCollection = async (req: Request, res: Response, next: any) => {
    const collectionName = req.params.name

    try {
        // if (!mongoose.isValidObjectId(collectionId)) {
        //     return res.status(400).json(`Invalid collection id: ${collectionId}`)
        // }

        const collection = await Collection.find({ name: collectionName }).exec()

        if (!collection) {
            return res.status(404).json("Collection not found")
        } else {
            return res.status(200).json(collection[0])
        }

    } catch (error) {
        next(error)
    }
}

const createCollection = async (req: Request, res: Response, next: NextFunction) => {
    const name = req.body.name
    const description = req.body.description

    try {
        const newCollection = await Collection.create({
            name: name,
            description: description,
        })

        return res.status(201).json(newCollection)
    } catch (error) {
        next(error)
    }
}

const batchDeleteCollections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collectionsToDelete = req.params.collection

        if (!collectionsToDelete) {
            return res.status(400).send({ message: "Collections not found" })
        }
        const collectionsToDeleteList = collectionsToDelete.split(",")
        const existingCollections = await Collection.find({ _id: { $in: collectionsToDeleteList } })

        if (existingCollections.length === 0) {
            return res.status(404).send({ message: `Collection with id ${collectionsToDelete} not found` })
        }

        const result = await Collection.deleteMany({ _id: { $in: collectionsToDeleteList } })

        res.status(200).json({ message: req.params.collection, deletedCount: result.deletedCount })
    } catch (error) {
        next(error)
    }
}

const patchCollection = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const CollectionId = req.params.id
    const updateData = req.body

    if (!mongoose.isValidObjectId(CollectionId)) {
        return res.status(400).json({ message: "Invalid Collection ID" })
    }

    try {
        const result = await Collection.updateOne({ _id: new ObjectId(CollectionId) }, { $set: updateData }, { upsert: false })

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: `Collection with id ${CollectionId} not found` })
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: "No changes made to the collection" })
        }

        const updatedCollection = await Collection.findById(CollectionId)
        return res.status(200).json(updatedCollection)
    } catch (error) {
        next(error)
    }
})

module.exports = {
    getAllCollections,
    getCollection,
    createCollection,
    batchDeleteCollections,
    artworksInCollection,
    patchCollection,
}