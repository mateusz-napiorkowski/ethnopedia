import { Request, Response } from "express"
import mongoose, { ClientSession, SortOrder } from "mongoose"
import { authAsyncWrapper } from "../middleware/auth"
import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection";
import { updateArtworkCategories } from "../utils/artworks";
import { hasValidCategoryFormat, isValidCollectionCategoryStructureForCollectionUpdate, trimCategoryNames } from "../utils/categories";

export const getAllCollections = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string)
        const pageSize = parseInt(req.query.pageSize as string)
        const sortOrder = req.query.sortOrder
        
        if(!page || !pageSize || !sortOrder)
            throw new Error("Request is missing query params")

        const collections = await CollectionCollection.find()
            .collation({ locale: 'en', strength: 1 })
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
        const collectionId = req.params.collectionId
        const collection = await CollectionCollection.findOne({ _id: collectionId }).exec()
        if (collection == null)
            throw new Error("Collection not found")
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

export const createCollection = authAsyncWrapper(async (req: Request, res: Response) => {
    const collectionName = req.body.name
    const collectionDescription = req.body.description
    try {
        if(!collectionName || !collectionDescription || !req.body.categories || !hasValidCategoryFormat(req.body.categories))
            throw new Error("Incorrect request body provided")
        const categories = trimCategoryNames(req.body.categories)
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const duplicateCollection = await CollectionCollection.findOne({ name: collectionName }, null, { session }).exec();
            if (duplicateCollection)
                throw new Error("Collection with provided name already exists");
            const newCollection = await CollectionCollection.create(
                [{
                    name: req.body.name.trim(),
                    description: req.body.description.trim(),
                    categories: categories
                }],
                { session }
            );
            res.status(201).json(newCollection);
        });
        session.endSession();
    } catch (error) {
        const err = error as Error;
        console.error(error);
        if (err.message === "Incorrect request body provided")
            res.status(400).json({ error: err.message });
        else if (err.message === "Collection with provided name already exists")
            res.status(409).json({ error: err.message });
        else
            res.status(503).json({ error: "Database unavailable" });
    }
});


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

export const updateCollection = authAsyncWrapper(async (req: Request, res: Response) => {
    const collectionId = req.params.id;
    const name = req.body.name
    const description = req.body.description
    try {
        if (!name || !description || !req.body.categories || !hasValidCategoryFormat(req.body.categories))
            throw new Error("Incorrect request body provided");
        const categories = trimCategoryNames(req.body.categories)
        const session = await mongoose.startSession();
        await session.withTransaction(async (session: ClientSession) => {
            const collection = await CollectionCollection.findById(collectionId, null, { session }).exec();
            if (!collection)
                throw new Error("Collection not found");
            const artworks = await Artwork.find({ collectionName: collection.name }, null, { session }).exec();
            await Promise.all(artworks.map(async (artwork: any) => {
                artwork.collectionName = name;
                if(!isValidCollectionCategoryStructureForCollectionUpdate(artwork.categories, categories))
                    throw Error("Incorrect request body provided")
                artwork.categories = updateArtworkCategories(artwork.categories, categories)
                await artwork.save({ session });
            }));

            collection.name = name;
            collection.description = description;
            collection.categories = categories;
            await collection.save({ session });

            res.status(200).json(collection);
        });

        session.endSession();
    } catch (error) {
        const err = error as Error;
        console.error(error);
        if (err.message === "Incorrect request body provided") {
            res.status(400).json({ error: err.message });
        } else if (err.message === "Collection not found") {
            res.status(404).json({ error: err.message });
        } else {
            res.status(503).json({ error: "Database unavailable" });
        }
    }
});

