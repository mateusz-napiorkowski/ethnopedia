import { Request, Response } from "express"
import mongoose, { ClientSession, SortOrder } from "mongoose"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection"
import { constructQuickSearchFilter, constructAdvSearchFilter, sortRecordsByCategory, constructTopmostCategorySearchTextFilter, handleFileUploads, handleFileDeletions } from "../utils/artworks"
import { artworkCategoriesHaveValidFormat } from "../utils/categories";
import fs from "fs";
import path from "path";
import { fileToDelete } from "../utils/interfaces";

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
        const files = req.files as Express.Multer.File[] | undefined
        const collectionId = req.body.collectionId
        let categories;        
        try {
            categories = JSON.parse(req.body.categories);
        } catch {
            throw new Error(`Incorrect request body provided`);
        }
        const originalNames = files?.map((file: any) => file.originalname) || []
        if(
            !categories ||
            !collectionId ||
            (files && Array.isArray(files) && files.length > 5) || // more than 5 files
            originalNames?.length > new Set(originalNames).size // duplicate filenames
        )
            throw new Error(`Incorrect request body provided`)
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const collection = await CollectionCollection.findOne({_id: collectionId}, null, {session}).exec()
            if (collection == null)
                throw new Error("Collection not found")
            if(!artworkCategoriesHaveValidFormat(categories, collection.categories))
                throw new Error(`Incorrect request body provided`)

            const artwork = new Artwork({ categories: categories, collectionName: collection.name });
            await artwork.save({ session });

            const {
                uploadedFilesCount,
                failedUploadsCount,
                failedUploadsCauses
            } = await handleFileUploads(artwork, files, collection._id, session)

            res.status(201).json({
                artwork,
                uploadedFilesCount,
                failedUploadsCount,
                failedUploadsCauses
            })
        })
        session.endSession()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if(err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else if(err.message === `Internal server error`)
            res.status(500).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}))

export const editArtwork = authAsyncWrapper((async (req: Request, res: Response) => {
    try {
        const filesToUpload = req.files as Express.Multer.File[]
        const artworkId = req.params.artworkId
        const collectionId = req.body.collectionId
        let categories, filesToDelete: fileToDelete[];       
        try {
            categories = JSON.parse(req.body.categories);
            if(req.body.filesToDelete)
                filesToDelete = JSON.parse(req.body.filesToDelete)
        } catch {
            throw new Error(`Incorrect request body provided`);
        }
        if(!categories || !collectionId)
            throw new Error('Incorrect request body provided')

        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const collection = await CollectionCollection.findOne({_id: collectionId}, null, {session}).exec()
            if (collection == null)
                throw new Error("Collection not found")
            if(!artworkCategoriesHaveValidFormat(categories, collection.categories))
                throw new Error(`Incorrect request body provided`)

            const artwork = await Artwork.findOne({_id: artworkId}, null, {session}).exec()
            if (artwork == null)
                throw new Error("Artwork not found")

            const currentFilenames = artwork.files.map((file: any) => file.originalFilename) || []
            const newFilenames = filesToUpload?.map((file: any) => file.originalname) || []
            const allFilenames = [...currentFilenames, ...newFilenames]
            if(
                artwork?.collectionName != collection.name ||
                artwork.files.length + filesToUpload.length > 5 || // more than 5 files
                allFilenames?.length > new Set(allFilenames).size // duplicate filenames
            )
                throw new Error(`Incorrect request body provided`)

            artwork.categories = categories
            await artwork.save({session})

            const {
                deletedFilesCount,
                failedDeletesCount,
                failedDeletesCauses
            } = await handleFileDeletions(artwork, filesToDelete, collection._id, session)
            const {
                uploadedFilesCount,
                failedUploadsCount,
                failedUploadsCauses
            } = await handleFileUploads(artwork, filesToUpload, collection._id, session)

            res.status(201).json({
                updatedArtwork: artwork,
                uploadedFilesCount,
                failedUploadsCount,
                failedUploadsCauses,
                deletedFilesCount,
                failedDeletesCount,
                failedDeletesCauses
            })
        })
        session.endSession()
        
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if(err.message === `Artwork not found` || err.message === "Collection not found")
            res.status(404).json({ error: err.message })
        else if(err.message === "Internal server error")
            res.status(500).json({ error: err.message })
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
            const foundArtworks = await Artwork.find({ _id: { $in: artworksToDeleteIds }}, null, { session }).exec()
            if (foundArtworks.length !== artworksToDeleteIds.length)
                throw new Error("Artworks not found")
            const result = await Artwork.deleteMany({ _id: { $in: artworksToDeleteIds } }, { session }).exec()
            for(const artwork of foundArtworks) {
                for(const file of artwork.files) {
                   const absoluteFilePath = path.join(__dirname, "..", file.filePath as string);
                   if (fs.existsSync(absoluteFilePath)) fs.unlinkSync(absoluteFilePath); 
                }
            }
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