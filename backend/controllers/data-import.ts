import { Request, Response } from "express"
import Artwork from "../models/artwork";
import { authAsyncWrapper } from "../middleware/auth"
import { prepRecords } from "../utils/controllers-utils/data-import";
import CollectionCollection from "../models/collection";
import mongoose, { ClientSession } from "mongoose";

export const importData = authAsyncWrapper(async (req: Request, res: Response) => {
    try {
        if(!req.body.importData || req.body.importData.length < 2 || !req.body.collectionName )
            throw new Error("Incorrect request body provided")
        const session = await mongoose.startSession()
        await session.withTransaction(async (session: ClientSession) => {
            const collectionName = req.body.collectionName
            const foundCollections = await CollectionCollection.find({name: collectionName}, null, {session}).exec()
            if (foundCollections.length !== 1)
                throw new Error(`Collection not found`)
            const records = prepRecords(req.body.importData, collectionName)
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
        else if (err.message === `Error preparing data for database insertion`)
            res.status(500).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
})