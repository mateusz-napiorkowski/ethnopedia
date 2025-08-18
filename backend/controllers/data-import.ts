import { Request, Response } from "express"
import Artwork from "../models/artwork";
import { authAsyncWrapper } from "../middleware/auth"
import { getNewRecordIdsMap, handleFilesUnzipAndUpload, prepRecords } from "../utils/data-import";
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
            const records = await prepRecords(req.body.importData, collectionName, false, collectionId, undefined)
            const bulkWriteOps = records.map(record => ({
                updateOne: {
                    filter: { _id: record._id, },
                    update: { $set: record },
                    upsert: true
                }
            }));
            const result = await Artwork.bulkWrite(bulkWriteOps, {session});
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
        let importData;        
        try {
            importData = JSON.parse(req.body.importData);
        } catch {
            throw new Error(`Incorrect request body provided`);
        }
        const collectionName = req.body.collectionName
        const description = req.body.description
        const zipFile = req.file
        if(!importData || importData.length < 2 || !collectionName || !description )
            throw new Error("Incorrect request body provided")
        if(zipFile && !/\.(zip)$/i.test(zipFile.originalname))
            throw Error("Invalid file extension")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const categoriesArray = importData[0].filter((cat: string) => cat !== "_id").map((category: string) => category.trim())
            const missingCategories = findMissingParentCategories(categoriesArray)
            if(missingCategories.length !== 0)
                throw new Error(
                    "Invalid categories data",
                    {cause: `Brakujące kategorie nadrzędne: ${missingCategories.toString()}`}
                )
            const categories = transformCategoriesArrayToCategoriesObject(categoriesArray)
            const newCollection = await CollectionCollection.create([
                {name: collectionName, description: description, categories: categories}
            ], {session})

            const newRecordIdsMap = getNewRecordIdsMap(importData)
            const records = await prepRecords(importData, collectionName, true, newCollection[0]._id.toString(), newRecordIdsMap, zipFile)
            const result = await Artwork.insertMany(records, {session})
            return res.status(201).json({newCollection, result})
        });
        session.endSession()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Incorrect request body provided` || err.message === `Invalid file extension`)
            res.status(400).json({ error: err.message })
        else if (err.message === "Invalid data in the spreadsheet file" || err.message === "Invalid categories data"){
            res.status(400).json({ error: err.message, cause: err.cause })}
        else
            res.status(503).json({ error: `Database unavailable` })
    }
})