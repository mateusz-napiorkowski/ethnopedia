import { NextFunction, Request, Response } from "express"
import { getMongoDBNativeDriverClient } from "../db/connect"
const mongoClient = getMongoDBNativeDriverClient()
const jwt = require("jsonwebtoken")

interface subData {
    name: string
    values: string
    subcategories: Array<any>,
    isSelectable: boolean
}

const fillSubcategories: any = (depth: number, fields: any, allAttrs: any, header: any, recordsData: any, recordIndex: number) => {
    let subs: any = []
    let deeperFields: any = []
    fields.forEach((field: any) => {
        deeperFields = []
        header.forEach((attrName: string, elementIndex: number) => {
            if(attrName.startsWith(field) && attrName.split(".").length === depth + 1) {
                deeperFields.push(attrName)
            }
        });
        let newSub: subData = {name: field.split(".").slice(-1)[0],
            values: recordsData[recordIndex][header.indexOf(field)].toString().split(";").filter((i: any) => i !== ""),
            subcategories: [],
            isSelectable: false
        }
        if(deeperFields.length !== 0) {
            newSub.subcategories = fillSubcategories(depth + 1, deeperFields, allAttrs, header, recordsData, recordIndex)
        }
        subs.push(newSub)
    });
    return subs
}



const importData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            const header = req.body.importData[0]
            let headerAttrsInArrays: any = []
            header.forEach((attr:string, index:String) => {
                headerAttrsInArrays.push(attr.split("."))
            });
            const recordsData = req.body.importData.slice(1)
            const records: Array<[]> = []
            for(const recordIndex in recordsData) {
                const recordAttrs = recordsData[recordIndex]
                let newRecord: any = {categories: []}
                let depth = 1
                const categories: any = newRecord.categories
                recordAttrs.forEach((cellVal: any, attrIndex: number) => {
                    if(header[attrIndex].split(".").length === depth) {
                        let fields: any = []
                        header.forEach((element: any, elementIndex: number) => {
                            if(element.startsWith(header[attrIndex]) && element.split(".").length === depth + 1) {
                                fields.push(element)
                            }
                        });
                        const newCaterory: subData = {
                            name: header[attrIndex], 
                            values: recordAttrs[attrIndex].toString().split(";").filter((i: any) => i !== ""),
                            subcategories: [],
                            isSelectable: false
                        }
                        if(fields.length !== 0) {
                            newCaterory.subcategories = fillSubcategories(depth + 1, fields, recordAttrs, header, recordsData, recordIndex)
                        }
                        categories.push(newCaterory)
                    }
                });
                newRecord.collectionName = req.body.collectionName
                records.push(newRecord)
            }
            mongoClient.db().collection('artworks').insertMany(records)
            return res.status(201)
            } catch (error) {
                return res.status(401).json({ error: 'Access denied' });
            }
        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    importData,
}
