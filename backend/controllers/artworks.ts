import { Request, Response } from "express"
import mongoose, { ClientSession } from "mongoose"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection"
import { constructQuickSearchFilter, constructAdvSearchFilter, sortRecordsByCategory } from "../utils/artworks"
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

export const getArtworksForCollectionPage = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string)
        const pageSize = parseInt(req.query.pageSize as string)
        
        if(!page || !pageSize)
            throw new Error("Request is missing query params")

        const collectionName = req.params.collectionName
        const searchText = req.query.searchText
        const sortOrder = req.params.sortOrder
        
        const search = req.query.search === "true" ? true : false

        let queryFilter;
        if(!search)
            queryFilter = { collectionName: collectionName }
        else if(searchText)
            queryFilter = await constructQuickSearchFilter(searchText, collectionName)
        else
            queryFilter = await constructAdvSearchFilter(req.query, collectionName)
        
        const artworksFiltered = await Artwork.find(queryFilter).exec()
        const artworksSorted = sortRecordsByCategory(artworksFiltered, sortOrder)
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
        else
            res.status(503).json({ error: `Database unavailable` })
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
        const collectionCategories = foundCollections[0].categories
        if(!artworkCategoriesHaveValidFormat(req.body.categories, collectionCategories))
            throw new Error(`Incorrect request body provided`)
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
            res.status(503).json({ error: `Database unavailable` })
    }
}))

export const editArtwork = authAsyncWrapper((async (req: Request, res: Response) => {
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