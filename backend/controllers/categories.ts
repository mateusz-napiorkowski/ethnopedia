import { Request, Response } from "express"
import { getAllCategories } from "../utils/categories"

export const getCollectionCategories = async (req: Request, res: Response) => {
    try {
        const collectionId = req.params.collectionId
        const categories = await getAllCategories(collectionId)
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