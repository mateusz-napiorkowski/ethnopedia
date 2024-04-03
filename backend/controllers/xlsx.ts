import { Request, Response } from "express"
import excelJS from "exceljs"
import {getMongoDBNativeDriverClient} from "../db/connect"
const mongoClient = getMongoDBNativeDriverClient()

const Subsection = require("../models/subsection")


const getXlsxWithArtworksData = async (req: Request, res: Response, next: any) => {
    try {
        const collectionName = decodeURIComponent(req.params.collectionName)
        const filename = req.query.exportFilename
        const keysToInclude: any = req.query.keysToInclude
        const exportSelectedRecords: any = req.query.exportSelectedRecords
        let selectedArtworks: any = []
        if(exportSelectedRecords === "true" && req.query.selectedArtworks) {
            selectedArtworks = Object.values(req.query.selectedArtworks)
        }

        let workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet("test")

        const records = await mongoClient.db().collection('artworks').find({collectionName: collectionName}).toArray()
        
        let columnNames: Array<any> = []
        
        if(keysToInclude !== undefined) {
            Object.keys(keysToInclude).forEach((k: any) => {
                columnNames.push({header: keysToInclude[k], key: keysToInclude[k]})
            })
        }
        
        sheet.columns = columnNames

        if(exportSelectedRecords === "true") {
            records.forEach((record: any) => {
                if(selectedArtworks.includes(record._id.toString())) {
                    sheet.addRow(record)
                }            
            })
        } else {
            records.forEach((record: any) => {
                sheet.addRow(record)         
            })
        }        
        
        //cell formatting
        sheet.columns.forEach(function (column, i) {
            let maxLength = 0;
            column["eachCell"]!({ includeEmpty: true }, function (cell) {
                var columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength ) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength;
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);

        await workbook.xlsx.write(res)
        
        res.end()
    } catch (error) {
        next(error)
    }
}

const getXlsxWithCollectionData = async (req: Request, res: Response, next: any) => {
    try {
        const collectionName = decodeURIComponent(req.params.collectionName)

        let workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet("test")

        const records = await mongoClient.db().collection('artworks').find({collectionName: collectionName}).toArray()

        let columnNames: Array<any> = []      
        // find keys
        let keys: any = []
        records.forEach((record: any) => {
            for (const property in record) {
                if (property != "_id") {
                    keys.push(property)
                }
            }
        })
        let keysUnique = keys.filter((value: any, index: number, array: any) => {
            return array.indexOf(value) === index
        })

        keysUnique.forEach((k: any) => {
            columnNames.push({header: k, key: k})
        })
        sheet.columns = columnNames

        records.forEach((record: any) => {
            sheet.addRow(record)         
        })        
        
        // //cell formatting
        sheet.columns.forEach(function (column, i) {
            let maxLength = 0;
            column["eachCell"]!({ includeEmpty: true }, function (cell) {
                var columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength ) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength;
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + "test.xlsx");

        await workbook.xlsx.write(res)
        
        res.end()
    } catch (error) {
        next(error)
    }
}

const getAllCaterories = async (req: Request, res: Response, next: any) => {
    try {
        const collectionName = decodeURIComponent(req.params.collectionName)

        const records = await mongoClient.db().collection('artworks').find({collectionName: collectionName}).toArray()
        
        // find keys
        let keys: any = []
        records.forEach((record: any) => {
            for (const property in record) {
                if (property != "_id") {
                    keys.push(property)
                }
            }
        })
        let keysUnique = keys.filter((value: any, index: number, array: any) => {
            return array.indexOf(value) === index
        })
        return res.status(200).json({ keysUnique })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getXlsxWithArtworksData,
    getXlsxWithCollectionData,
    getAllCaterories
}