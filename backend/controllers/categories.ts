import { NextFunction, Request, Response } from "express"

const Artwork = require("../models/artwork")
const Category = require("../models/category")

const getNestedCategories = ((prefix: string, subcategories: any) => {
    let nestedCategories: Array<string> = []
    if(subcategories !== undefined) {
        for(const subcategory of subcategories){
            nestedCategories.push(`${prefix}${subcategory.name}`)
            nestedCategories.push(...getNestedCategories(`${prefix}${subcategory.name}.`, subcategory.subcategories))
        }
    }
    return nestedCategories
})

export const getCollectionCategories = async (req: Request, res: Response, next: NextFunction) => {
    const records = await Artwork.find({ collectionName: req.params.collectionName })
    let allCategories: Array<string> = []
    records.forEach((record:any) => {
        for(const category of record.categories){
            allCategories.push(category.name)
            allCategories.push(...getNestedCategories(`${category.name}.`, category.subcategories))
        }
    });
    const allCategoriesUnique = allCategories.filter((value, index, array) => {
        return array.indexOf(value) === index;
    })
    res.status(200).json({categories: allCategoriesUnique})
}

const getArtworkCategories = async (req: Request, res: Response, next: NextFunction) => {
    const page = typeof req.query.page === "string" ? parseInt(req.query.page) : 1
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit) : 5

    const skip = (page - 1) * limit

    // const total = await Category.countDocuments()
    // const totalPages = Math.ceil(total / limit)

    // const categories = await Category.find({}).skip(skip).limit(limit)
    try {
        const id = req.params.name

        const categories = await Category.find({ collectionName: id })

        res.status(200).json(categories)
    } catch (error) {
        console.error("Error finding categories:", error)
        res.status(500).json({ message: "Error fetching categories." })
    }
}

module.exports = {
    getCollectionCategories,
    getArtworkCategories,
}