import { Request, Response } from "express"
import { getCollectionCategoriesArray } from "../utils/controllers-utils/categories"
import Artwork from "../models/artwork"

export const getCollectionCategories = async (req: Request, res: Response) => {
    try {
        const collectionName = req.params.collectionName
        const records = await Artwork.find({ collectionName: collectionName }).exec()
        const categories = getCollectionCategoriesArray(records)
        res.status(200).json({categories: categories})
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
    
}