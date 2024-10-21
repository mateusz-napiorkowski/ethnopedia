import { NextFunction, Request, Response } from "express"
import mongoose, { ClientSession, SortOrder } from "mongoose"
import { findSearchText, findMatch, sortRecordsByTitle } from "../utils/controllers-utils/collections"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection";
import { constructQuickSearchFilter, constructAdvSearchFilter } from "../utils/controllers-utils/collections";
const util = require("util")
export const getAllCollections = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string)
        const pageSize = parseInt(req.query.pageSize as string)
        const sortOrder = req.query.sortOrder
        
        if(!page || !pageSize || !sortOrder)
            throw new Error("Request is missing query params")

        const collections = await CollectionCollection.find()
            .sort({name: sortOrder as SortOrder})
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec()
        
        const totalCollections = await CollectionCollection.countDocuments()
        
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
        const artworkCounts = await Artwork.aggregate(pipeline).exec()
        
        const collectionsData = collections.map((collection: any) => ({
            id: collection._id,
            name: collection.name,
            description: collection.description,
            artworksCount: artworkCounts.find((element) => element._id == collection.name)?.count ?? 0
        }))

        res.status(200).json({
            collections: collectionsData,
            total: totalCollections,
            currentPage: page,
            pageSize: pageSize,
        })    
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Request is missing query params")
            res.status(400).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
    
}

export const getCollection = async (req: Request, res: Response) => {
    try {
        const collectionName = req.params.name
        const collection = await CollectionCollection.findOne({ name: collectionName }).exec()
        if (!collection) {
            throw new Error("Collection not found")
        }
        res.status(200).json(collection) 
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === 'Collection not found')
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: 'Database unavailable' })
    }
}

export const getArtworksInCollection = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const page = parseInt(req.query.page as string)
        const pageSize = parseInt(req.query.pageSize as string)
        
        const searchText = req.query.searchText
        const sortOrder = req.query.sortOrder
        
        const search = req.query.search === "true" ? true : false

        let queryFilter;
        if(!search) {
            queryFilter = { collectionName: req.params.name }
        } else if(searchText) {
            queryFilter = await constructQuickSearchFilter(req.query.searchText, req.params.name)
        } else {
            queryFilter = await constructAdvSearchFilter(req.query, req.params.name)
        }

        const artworks = await Artwork.find(queryFilter).exec()
        const artworksForPage = artworks.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)  
        
        return res.json({
            artworks: artworksForPage,
            total: artworks.length,
            currentPage: page,
            pageSize: pageSize,
        })
    } catch (error: any) {
        next(error)
    }
}

export const createCollection = authAsyncWrapper(async (req: Request, res: Response) => {
    const collectionName = req.body.name
    const collectionDescription = req.body.description
    try {
        if(!collectionName || !collectionDescription)
            throw new Error("Incorrect request body provided")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const duplicateCollection = await CollectionCollection.findOne({name: collectionName}, null, {session}).exec()
            if(duplicateCollection)
                throw new Error("Collection with provided name already exists")
            const newCollection = await CollectionCollection.create([{name: req.body.name, description: req.body.description}], {session})
            res.status(201).json(newCollection)
        })
        session.endSession()
    } catch(error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Incorrect request body provided")
            res.status(400).json({ error: err.message })
        else if (err.message === "Collection with provided name already exists")
            res.status(409).json({ error: err.message })
        else 
            res.status(503).json( { error: "Database unavailable" })
    }
})

export const deleteCollections = authAsyncWrapper(async (req: Request, res: Response) => {
    const collectionsToDelete = req.body.ids
    try {
        if(!collectionsToDelete)
            throw new Error("Incorrect request body provided")
        if (Array.isArray(collectionsToDelete) && collectionsToDelete.length === 0)
            throw new Error("Collections not specified")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const existingCollections = await CollectionCollection.find({ _id: { $in: collectionsToDelete }}, null, { session }).exec()
            if (existingCollections.length !== collectionsToDelete.length)
                throw new Error("Collections not found")
            let deletedArtworksCount = 0
            for(const existingCollection of existingCollections) {
                const deletedArtworks = await Artwork.deleteMany({collectionName: existingCollection.name}, { session }).exec()
                deletedArtworksCount += deletedArtworks.deletedCount
            }
            const result = await CollectionCollection.deleteMany({ _id: { $in: collectionsToDelete } }, { session }).exec()
            res.status(200).json({ message: req.params.collection, deletedCount: result.deletedCount, deletedArtworksCount: deletedArtworksCount })
        })
        session.endSession()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Incorrect request body provided")
            res.status(400).json({ error: err.message })
        else if (err.message === "Collections not specified")
            res.status(400).json({ error: err.message })
        else if (err.message === "Collections not found")
            res.status(404).json({ error: err.message })
        else 
            res.status(503).json( { error: "Database unavailable" })
    }   
})