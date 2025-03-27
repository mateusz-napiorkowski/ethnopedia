import { Request, Response } from "express"
import { getAllCategories } from "../utils/categories"

export const getCollectionCategories = async (req: Request, res: Response) => {
    try {
        const collectionName = Buffer.from(req.params.collectionName, 'latin1').toString("utf-8")
        const categories = await getAllCategories(collectionName)
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