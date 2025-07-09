import { Request, Response } from "express"
import Artwork from "../models/artwork";
import { authAsyncWrapper } from "../middleware/auth"
import { prepRecords } from "../utils/data-import";
import CollectionCollection from "../models/collection";
import mongoose, { ClientSession } from "mongoose";
import { findMissingParentCategories, transformCategoriesArrayToCategoriesObject } from "../utils/categories";

export const importData = authAsyncWrapper(async (req: Request, res: Response) => {
    try {
        if(!req.body.importData || req.body.importData.length < 2 || !req.body.collectionId )
            throw new Error("Incorrect request body provided")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const collectionId = req.body.collectionId
            const foundCollections = await CollectionCollection.find({_id: collectionId}, null, {session}).exec()
            if (foundCollections.length !== 1 )
                throw new Error(`Collection not found`)
            const collectionName = foundCollections[0].name!
            const records = await prepRecords(req.body.importData, collectionName, false, collectionId)
            const result = await Artwork.insertMany(records, {session})
            return res.status(201).json(result)
        });
        session.endSession()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if (err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else if (err.message === "Invalid data in the spreadsheet file"){
            res.status(400).json({ error: err.message, cause: err.cause?.toString()})}
        else
            res.status(503).json({ error: `Database unavailable` })
    }
})
 
export const importDataAsCollection = authAsyncWrapper(async (req: Request, res: Response) => {
    try {
        if(!req.body.importData || req.body.importData.length < 2 || !req.body.collectionName || !req.body.description )
            throw new Error("Incorrect request body provided")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const collectionName = req.body.collectionName
            const categoriesArray = req.body.importData[0].map((category: string) => category.trim())
            const missingCategories = findMissingParentCategories(categoriesArray)
            if(missingCategories.length !== 0)
                throw new Error(
                    "Invalid categories data",
                    {cause: `Brakujące kategorie nadrzędne: ${missingCategories.toString()}`}
                )
            const categories = transformCategoriesArrayToCategoriesObject(categoriesArray)
            const newCollection = await CollectionCollection.create([
                {name: req.body.collectionName, description: req.body.description, categories: categories}
            ], {session})
            const records = await prepRecords(req.body.importData, collectionName, true)
            const result = await Artwork.insertMany(records, {session})
            return res.status(201).json({newCollection, result})
        });
        session.endSession()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided`)
            res.status(400).json({ error: err.message })
        else if (err.message === "Invalid data in the spreadsheet file" || err.message === "Invalid categories data"){
            res.status(400).json({ error: err.message, cause: err.cause })}
        else
            res.status(503).json({ error: `Database unavailable` })
    }
})