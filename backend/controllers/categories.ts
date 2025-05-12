import { Request, Response } from "express"
import { getAllCategories } from "../utils/categories"

export const getCategories = async (req: Request, res: Response) => {
    try {
        const collectionIds = req.query.collectionIds as Array<string>
        const categories = await getAllCategories(collectionIds)
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