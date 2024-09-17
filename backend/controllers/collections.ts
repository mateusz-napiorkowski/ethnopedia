import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { ObjectId } from "mongodb"
import { findSearchText, findMatch, sortRecordsByTitle } from "../utils/controllers-utils/collections"
const Collection = require("../models/collection")
const Category = require("../models/collection")
const Artwork = require("../models/artwork")
const jwt = require("jsonwebtoken")
import { authAsyncWrapper } from "../middleware/auth"

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

const getCollection = async (req: Request, res: Response, next: NextFunction) => {
    const collectionName = req.params.name
    try {
        const collection = await Collection.findOne({ name: collectionName }).exec()
        if (!collection) {
            const err = new Error("Collection not found")
            res.status(404).json({ error: err.message })
            return next(err)
        }
        return res.status(200).json(collection) 
    } catch {
        const err = new Error(`Database unavailable`)
        res.status(503).json({ error: err.message })
        return next(err)
    }
}

const getArtworksInCollection = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const pageSize = parseInt(req.query.pageSize as string) || 10
        let totalArtworks = await Artwork.countDocuments({ collectionName: req.params.name })
        let records = []
        const searchText = req.query.searchText
        const sortOrder = req.query.sortOrder
        if(sortOrder == "newest-first") {
            records = await Artwork.find({ collectionName: req.params.name }).sort({ "$natural": -1 })
        } else {
            records = await Artwork.find({ collectionName: req.params.name }).sort({ "$natural": 1 })
        }
        let recordsFinal: Array<any> = []
        if(req.query.searchText!==undefined) {
            // quicksearch
            let foundSearchText: boolean = false
            records.forEach((record:any) => {
                for(const category of record.categories){
                    foundSearchText = false
                    for(const value of category.values) {
                        if(value.toString().includes(searchText)) {
                            recordsFinal.push(record)
                            foundSearchText = true
                            break;
                        }
                    }
                    if(foundSearchText) {
                        break;
                    } else {
                        foundSearchText = findSearchText(searchText, category.subcategories)
                        if(foundSearchText) {
                            recordsFinal.push(record)
                            break;
                        }
                    }
                }
            })
        } else if(req.query.advSearch == "true") {
            /*advanced search*/
            let rules: any = {}
            for(const ruleField in req.query) {
                if(req.query.hasOwnProperty(ruleField) && !["page", "pageSize", "sortOrder", "advSearch"].includes(ruleField)) {
                    rules[ruleField] = req.query[ruleField]
                }
            }

            records.forEach((record:any) => {
                let matched: boolean = true
                for(const ruleField in rules) {
                    if(!findMatch(record.categories, ruleField.split("."), rules[ruleField])) {
                        matched = false
                        break
                    }
                }
                if(matched) {
                    recordsFinal.push(record)
                }
            })
        } 
        else {
            // without search criteria
            recordsFinal = records
        }

        if(sortOrder == "title-asc" || sortOrder == "title-desc") {
            recordsFinal = sortRecordsByTitle(recordsFinal, sortOrder)
        }
        totalArtworks = recordsFinal.length
        recordsFinal = recordsFinal.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
        return res.json({
            artworks: recordsFinal,
            total: totalArtworks,
            currentPage: page,
            pageSize: pageSize,
        })
    } catch (error: any) {
        next(error)
    }
}

const createCollection = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const collectionName = req.body.name
    const collectionDescription = req.body.description
    if(collectionName !== undefined && collectionDescription !== undefined) {
        try {
            const session = await mongoose.startSession()
            try {
                session.startTransaction()
                const duplicateCollection = await Collection.findOne({name: collectionName}).exec()
                if(duplicateCollection) {
                    await session.abortTransaction();
                    session.endSession();
                    const err = new Error(`Collection with provided name already exists`)
                    res.status(409).json({ error: err.message })
                    return next(err)
                }
                const newCollection = await Collection.create({name: req.body.name, description: req.body.description})
                await session.commitTransaction();
                session.endSession();
                return res.status(201).json(newCollection)
            } catch {
                await session.abortTransaction();
                session.endSession();
                const err = new Error(`Database unavailable`)
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

const deleteCollections = authAsyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const collectionsToDelete = req.body.ids
    if(collectionsToDelete !== undefined) {
        if (Array.isArray(collectionsToDelete) && collectionsToDelete.length === 0) {
            const err = new Error("Collections not specified")
            res.status(400).json({ error: err.message })
            return next(err)
        }
        try {
            const session = await mongoose.startSession()
            try {
                session.startTransaction()
                const existingCollections = await Collection.find({ _id: { $in: collectionsToDelete }}, null, { session }).exec()
                if (existingCollections.length !== collectionsToDelete.length) {
                    await session.abortTransaction();
                    session.endSession();
                    const err = new Error("Collections not found")
                    res.status(404).json({ error: err.message })
                    return next(err)
                }
                let deletedArtworksCount = 0
                for(const existingCollection of existingCollections) {
                    const deletedArtworks = await Artwork.deleteMany({collectionName: existingCollection.name}, { session }).exec()
                    deletedArtworksCount += deletedArtworks.deletedCount
                }
                const result = await Collection.deleteMany({ _id: { $in: collectionsToDelete } }, { session }).exec()
                
                await session.commitTransaction()
                session.endSession()
                return res.status(200).json({ message: req.params.collection, deletedCount: result.deletedCount, deletedArtworksCount: deletedArtworksCount })
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

module.exports = {
    getAllCollections,
    getCollection,
    getArtworksInCollection,
    createCollection,
    deleteCollections
}