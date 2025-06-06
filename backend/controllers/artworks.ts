import { Request, Response } from "express"
import mongoose, { ClientSession, SortOrder } from "mongoose"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection"
import { constructQuickSearchFilter, constructAdvSearchFilter, sortRecordsByCategory, constructTopmostCategorySearchTextFilter } from "../utils/artworks"
import { artworkCategoriesHaveValidFormat } from "../utils/categories";

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

export const getArtworksForPage = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string)
        const pageSize = parseInt(req.query.pageSize as string)
        const sortBy = req.query.sortBy as string
        const sortOrder = req.query.sortOrder as SortOrder
        const collectionIds = req.query.collectionIds as Array<string>

        if(!page || !pageSize || !sortBy || !sortOrder || ! collectionIds)
            throw new Error("Request is missing query params")
        
        const collections = await CollectionCollection.find({_id: {$in: collectionIds}}).exec()

        if (collections.length === 0)
            throw new Error(`Collection not found`)

        const collectionNames = collections.map(collection => collection.name as string);
        
        const searchText = req.query.searchText
        const search = req.query.search === "true" ? true : false
        let queryFilter;
        if(!search)
            queryFilter = { collectionName: {$in: collectionNames} }
        else if(searchText)
            queryFilter = await constructQuickSearchFilter(searchText, collectionIds, collectionNames)
        else
            queryFilter = await constructAdvSearchFilter(req.query, collectionNames)

        const artworksFiltered = await Artwork.find(queryFilter)
            .sort(["createdAt", "updatedAt"].includes(sortBy) ? {[sortBy]: sortOrder} : {}) //sort by createdAt or updatedAt if it was requested
            .exec()
        const artworksSorted = sortRecordsByCategory(artworksFiltered, sortBy, sortOrder) //returns artworksFiltered if sortBy equals createdAt or updatedAt
        const artworksForPage = artworksSorted.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

        return res.status(200).json({
            artworks: artworksForPage,
            total: artworksFiltered.length,
            currentPage: page,
            pageSize: pageSize,
        })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Request is missing query params")
            res.status(400).json({ error: err.message })
        else if (err.message === "Collection not found")
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}

export const getArtworksBySearchTextMatchedInTopmostCategory = async (req: Request, res: Response) => {
    try {
        const searchText = req.query.searchText as string
        const numOfArtworks = parseInt(req.query.n as string)

        if(!searchText || !numOfArtworks)
            throw new Error("Request is missing query params")
        
        const queryFilter = constructTopmostCategorySearchTextFilter(searchText)

        const artworks = await Artwork.find(queryFilter).limit(numOfArtworks).exec()

        return res.status(200).json({
            artworks: artworks,
            total: artworks.length
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

export const createArtwork = authAsyncWrapper((async (req: Request, res: Response) => {
    try {
        console.log("back api")
        const collectionName = req.body.collectionName
        if(!req.body.categories || !collectionName)
            throw new Error(`Incorrect request body provided`)
        const foundCollections = await CollectionCollection.find({name: collectionName}).exec()
        if (foundCollections.length !== 1)
            throw new Error(`Collection not found`)
        const collectionCategories = foundCollections[0].categories
        if(!artworkCategoriesHaveValidFormat(req.body.categories, collectionCategories))
            throw new Error(`Incorrect request body provided`)
        const newArtwork = await Artwork.create(req.body)
        console.log(req.body);
        res.status(201).json(newArtwork)
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
        {
            console.log("error 404");
            res.status(400).json({ error: err.message })
        }
        else if(err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}))

export const editArtwork = authAsyncWrapper((async (req: Request, res: Response) => {
    try {
        const artworkId = req.params.artworkId
        if(!req.body.categories || !req.body.collectionName)
            throw new Error('Incorrect request body provided')
        const resultInfo = await Artwork.replaceOne({_id: artworkId, collectionName: req.body.collectionName}, req.body).exec()
        if(resultInfo.modifiedCount === 0) {
            throw new Error('Artwork not found')
        }
        return res.status(201).json(resultInfo)
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

export const deleteArtworks = authAsyncWrapper(async (req: Request, res: Response) => {
    try {
        const artworksToDeleteIds = req.body.ids
        if (!artworksToDeleteIds)
            throw new Error("Incorrect request body provided") 
        if (Array.isArray(artworksToDeleteIds) && artworksToDeleteIds.length === 0)
            throw new Error("Artworks not specified")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const databaseArtworksToDeleteCounted = await Artwork.countDocuments({ _id: { $in: artworksToDeleteIds }}, { session }).exec()
            if (databaseArtworksToDeleteCounted !== artworksToDeleteIds.length)
                throw new Error("Artworks not found")
            const result = await Artwork.deleteMany({ _id: { $in: artworksToDeleteIds } }, { session }).exec()
            res.status(200).json(result)
        });
        session.endSession()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Incorrect request body provided")
            res.status(400).json({ error: err.message })
        else if (err.message === "Artworks not specified")
            res.status(400).json({ error: err.message }) 
        else if (err.message === "Artworks not found")
            res.status(404).json({ error: err.message })
        else 
            res.status(503).json( { error: "Database unavailable" })    
    }  
})