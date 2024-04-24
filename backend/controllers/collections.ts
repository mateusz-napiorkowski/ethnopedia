import { NextFunction, Request, Response } from "express"
import mongoose from "mongoose"
import { ObjectId } from "mongodb"
import {getMongoDBNativeDriverClient} from "../db/connect"
const mongoClient = getMongoDBNativeDriverClient()
const Collection = require("../models/collection")
const Category = require("../models/collection")
const Artwork = require("../models/artwork")
const asyncWrapper = require("../middleware/async")
const jwt = require("jsonwebtoken")

const getAllCollections = async (req: Request, res: Response, next: any) => {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10

    const collections = await Collection.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    const categories = await Category.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    const totalCollections = await Collection.countDocuments({})

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

    const artworks = await Artwork.aggregate(pipeline)
    let artworkMap = new Map()

    artworks.forEach((artwork: any) => {
        artworkMap.set(artwork._id, artwork.count)
    })

    let combinedData = new Map()

    collections.forEach((collection: any) => {
        combinedData.set(collection._id, {
            id: collection._id,
            name: collection.name,
            description: collection.description,
            artworksCount: artworkMap.get(collection.name) || 0,
            categoriesCount: 17,
        })
    })

    let combinedArray = Array.from(combinedData.values())

    res.status(200).json({
        collections: combinedArray,
        total: totalCollections,
        currentPage: page,
        pageSize: pageSize,
    })
}

const addNewCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            mongoClient.db().collection('collections').insertOne({name: req.body.name, description: req.body.description})
            return res.status(201)
        } catch (error) {
            return res.status(401).json({ error: 'Access denied' });
        }
        
    } catch (error) {
        next(error)
    }
}

function countLabelsRecursively(categoryDetails: any) {
    let count = 0
    const recurse = (details: any) => {
        if (details)
            details.forEach((detail: any) => {
                count++
                if (detail.subcategories) {
                    recurse(detail.subcategories)
                }
            })
    }
    recurse(categoryDetails)
    return count
}

const findSearchText = (searchText: any, subcategories: any) => {
    if(subcategories !== undefined) {
        for(const category of subcategories){
            for(const value of category.values) {
                if(value.toString().includes(searchText)) {
                    return true
                }
            }
            if(findSearchText(searchText, category.subcategories)) {
                return true
            }
        }
    }
    return false
}

const findMatch = (subcategories: any, nameArray: Array<string>, ruleValue: string) => {
    let matched: boolean = false
    const categoryDepth = nameArray.length
    if(categoryDepth > 1) {
        const categoryPrefix = nameArray[0]
        for(const subcategory of subcategories) {
            if(subcategory.name == categoryPrefix) {
                matched = findMatch(subcategory.subcategories, nameArray.slice(1), ruleValue)
                if(matched) return true
            }
        }
    } else if (categoryDepth == 1) {
        for(const subcategory of subcategories) {
            if(subcategory.name == nameArray[0]) {   
                for(const subcategoryValue of subcategory.values) {
                    if(subcategoryValue == ruleValue) {
                        return true
                    }
                }
            }
        }
    }
    return false
}

const sortRecordsByTitle = (records: any, order: any) => {
    if(order == "title-asc" || order == "title-desc") {
        let tempArray: any = []
        records.forEach((record:any) => {
            for(const category of record.categories){
                if(category.name == "Tytuł") {
                    tempArray.push([record, category.values.join(", ")])
                }
            }
        })
        tempArray.sort((a: any,b: any) => a[1].toUpperCase().localeCompare(b[1].toUpperCase()));
        let sortedRecords: any = []
        tempArray.forEach((pair:any) => {
            sortedRecords.push(pair[0])
        })
        if(order == "title-asc") {
            return sortedRecords
        } else {
            return sortedRecords.reverse()
        }
    }
}

const artworksInCollection = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const pageSize = parseInt(req.query.pageSize as string) || 10
        let totalArtworks = await Artwork.countDocuments({ collectionName: req.params.name })
        let records = []
        const searchText = req.query.searchText
        const sortOrder = req.query.sortOrder
        if(sortOrder == "newest-first") {
            records = await Artwork.find({ collectionName: req.params.name }).sort({ "$natural": -1 })
        } else {
            records = await Artwork.find({ collectionName: req.params.name }).sort({ "$natural": 1 })
        }
        let recordsFinal: Array<any> = []
        if(req.query.searchText!==undefined) {
            // quicksearch
            let foundSearchText: boolean = false
            records.forEach((record:any) => {
                for(const category of record.categories){
                    foundSearchText = false
                    for(const value of category.values) {
                        if(value.toString().includes(searchText)) {
                            recordsFinal.push(record)
                            foundSearchText = true
                            break;
                        }
                    }
                    if(foundSearchText) {
                        break;
                    } else {
                        foundSearchText = findSearchText(searchText, category.subcategories)
                        if(foundSearchText) {
                            recordsFinal.push(record)
                            break;
                        }
                    }
                }
            })
        } else if(req.query.advSearch == "true") {
            /*advanced search*/
            let rules: any = {}
            for(const ruleField in req.query) {
                if(req.query.hasOwnProperty(ruleField) && !["page", "pageSize", "sortOrder", "advSearch"].includes(ruleField)) {
                    rules[ruleField] = req.query[ruleField]
                }
            }

            records.forEach((record:any) => {
                let matched: boolean = true
                for(const ruleField in rules) {
                    if(!findMatch(record.categories, ruleField.split("."), rules[ruleField])) {
                        matched = false
                        break
                    }
                }
                if(matched) {
                    recordsFinal.push(record)
                }
            })
        } 
        else {
            // without search criteria
            recordsFinal = records
        }

        if(sortOrder == "title-asc" || sortOrder == "title-desc") {
            recordsFinal = sortRecordsByTitle(recordsFinal, sortOrder)
        }
        totalArtworks = recordsFinal.length
        recordsFinal = recordsFinal.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
        return res.json({
            artworks: recordsFinal,
            total: totalArtworks,
            currentPage: page,
            pageSize: pageSize,
        })
    } catch (error: any) {
        next(error)
    }
}

const getCollection = async (req: Request, res: Response, next: any) => {
    const collectionName = req.params.name

    try {
        // if (!mongoose.isValidObjectId(collectionId)) {
        //     return res.status(400).json(`Invalid collection id: ${collectionId}`)
        // }

        const collection = await Collection.find({ name: collectionName }).exec()

        if (!collection) {
            return res.status(404).json("Collection not found")
        } else {
            return res.status(200).json(collection[0])
        }

    } catch (error) {
        next(error)
    }
}

const createCollection = async (req: Request, res: Response, next: NextFunction) => {
    const name = req.body.name
    const description = req.body.description

    try {
        const newCollection = await Collection.create({
            name: name,
            description: description,
        })

        return res.status(201).json(newCollection)
    } catch (error) {
        next(error)
    }
}

const batchDeleteCollections = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            const collectionsToDelete = req.params.collection

            if (!collectionsToDelete) {
                return res.status(400).send({ message: "Collections not found" })
            }
            const collectionsToDeleteList = collectionsToDelete.split(",")
            const existingCollections = await Collection.find({ _id: { $in: collectionsToDeleteList } })

            if (existingCollections.length === 0) {
                return res.status(404).send({ message: `Collection with id ${collectionsToDelete} not found` })
            }

            for(const id of collectionsToDeleteList) {
                const collection = await Collection.find({_id: id})
                await Artwork.deleteMany({collectionName: collection[0].name.toString()})
            }
            const result = await Collection.deleteMany({ _id: { $in: collectionsToDeleteList } })

            res.status(200).json({ message: req.params.collection, deletedCount: result.deletedCount })
        } catch (error) {
            return res.status(401).json({ error: 'Access denied' });
        } 
    } catch (error) {
        next(error)
    }
}

const patchCollection = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const CollectionId = req.params.id
    const updateData = req.body

    if (!mongoose.isValidObjectId(CollectionId)) {
        return res.status(400).json({ message: "Invalid Collection ID" })
    }

    try {
        const result = await Collection.updateOne({ _id: new ObjectId(CollectionId) }, { $set: updateData }, { upsert: false })

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: `Collection with id ${CollectionId} not found` })
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({ message: "No changes made to the collection" })
        }

        const updatedCollection = await Collection.findById(CollectionId)
        return res.status(200).json(updatedCollection)
    } catch (error) {
        next(error)
    }
})

module.exports = {
    getAllCollections,
    getCollection,
    createCollection,
    batchDeleteCollections,
    artworksInCollection,
    patchCollection,
    addNewCollection
}