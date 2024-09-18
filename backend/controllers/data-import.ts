import { NextFunction, Request, Response } from "express"
import { subData, fillSubcategories } from "../utils/controllers-utils/data-import"
// import jwt from "jsonwebtoken";
import Artwork from "../models/artwork";

export const importData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(401).json({ error: 'Access denied' });
        try {
            // TODO: variable below was not used should it be removed?
            // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string)
            const header = req.body.importData[0]
            const headerAttrsInArrays: any = []
            header.forEach((attr:string) => {
                headerAttrsInArrays.push(attr.split("."))
            });
            const recordsData = req.body.importData.slice(1)
            const records: Array<[]> = []
            for(const recordIndex in recordsData) {
                const recordAttrs = recordsData[recordIndex]
                const newRecord: any = {categories: []}
                const depth = 1
                const categories: any = newRecord.categories
                recordAttrs.forEach((cellVal: any, attrIndex: number) => {
                    if(header[attrIndex].split(".").length === depth) {
                        const fields: any = []
                        header.forEach((element: any) => {
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
            await Artwork.insertMany(records)
            return res.status(201)
            } catch {
                return res.status(401).json({ error: 'Access denied' });
            }
        
    } catch (error) {
        next(error)
    }
}
