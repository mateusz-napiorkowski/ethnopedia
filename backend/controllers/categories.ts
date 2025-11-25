import { Request, Response } from "express"
import { getAllCategories } from "../utils/categories"

export const getCategories = async (req: Request, res: Response) => {
    try {
        const collectionIds = typeof req.query.collectionIds === "string" ? Array(req.query.collectionIds) : req.query.collectionIds as Array<string>
        if(!collectionIds)
            throw new Error("Request is missing query params")
        const categories = await getAllCategories(collectionIds, req.headers.authorization)
        res.status(200).json({categories: categories})
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Request is missing query params`)
            res.status(400).json({ error: err.message })
        else if (err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
    
}