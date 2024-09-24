import { NextFunction, Request, Response } from "express"
import mongoose, { ClientSession } from "mongoose"
import { findSearchText, findMatch, sortRecordsByTitle } from "../utils/controllers-utils/collections"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection";

export const getAllCollections = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const collections = await CollectionCollection.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    // TODO: code below was not used, should it be removed?
    // const categories = await Category.find({})
    //     .skip((page - 1) * pageSize)
    //     .limit(pageSize)

    const totalCollections = await CollectionCollection.countDocuments({})

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
    const artworkMap = new Map()

    artworks.forEach((artwork: any) => {
        artworkMap.set(artwork._id, artwork.count)
    })

    const combinedData = new Map()

    collections.forEach((collection: any) => {
        combinedData.set(collection._id, {
            id: collection._id,
            name: collection.name,
            description: collection.description,
            artworksCount: artworkMap.get(collection.name) || 0,
            categoriesCount: 17,
        })
    })

    const combinedArray = Array.from(combinedData.values())

    res.status(200).json({
        collections: combinedArray,
        total: totalCollections,
        currentPage: page,
        pageSize: pageSize,
    })
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
            const rules: any = {}
            for(const ruleField in req.query) {
                if(req.query?.ruleField && !["page", "pageSize", "sortOrder", "advSearch"].includes(ruleField)) {
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
            return res.status(200).json({ message: req.params.collection, deletedCount: result.deletedCount, deletedArtworksCount: deletedArtworksCount })
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