import { Request, Response } from "express"
import excelJS from "exceljs"
import Artwork from "../models/artwork";
import { fillRow } from "../utils/data-export"
import { getAllCategories } from "../utils/categories";
import { constructAdvSearchFilter, constructQuickSearchFilter } from "../utils/artworks";
import CollectionCollection from "../models/collection";

export const getXlsxWithCollectionData = async (req: Request, res: Response) => {
    try {
        const collectionId = req.params.collectionId
        const collection = await CollectionCollection.findOne({_id: collectionId}).exec()
        if (collection == null)
            throw new Error(`Collection not found`)
        const collectionName = collection?.name as string

        const workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet(collectionName)

        const columnNames = await getAllCategories([collectionId])
        sheet.columns = columnNames.map((name :string) => {return {header: name, key: name}})
        
        const records = await Artwork.find({collectionName: collectionName}).exec()
        records.forEach((record: any) => sheet.addRow(fillRow(columnNames, record.categories)))

        // //cell formatting
        sheet.columns.forEach((column)=>  {
            let maxLength = 0;
            column["eachCell"]!({ includeEmpty: true }, function (cell) {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength ) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength;
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment");

        await workbook.xlsx.write(res)
        
        res.status(200).end()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}

export const getXlsxWithArtworksData = async (req: Request, res: Response) => {
    try {
        const collectionId = req.params.collectionId

        const columnNames = typeof req.query.columnNames === "string" ? Array(req.query.columnNames) : req.query.columnNames as Array<string>
        
        const exportExtent = req.query.exportExtent
        if(!columnNames || !exportExtent)
            throw new Error("Request is missing query params")

        const collection = await CollectionCollection.findOne({_id: collectionId}).exec()
        if (collection == null)
            throw new Error(`Collection not found`)
        const collectionName = collection?.name as string

        const workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet(collectionName)
        sheet.columns = columnNames.map((name: string) => {return {header: name, key: name}})

        const selectedArtworks = req.query.selectedArtworks
        if(exportExtent === "selected" && !selectedArtworks) {    
            throw new Error("Request is missing query params")
        } else if(exportExtent === "selected" && selectedArtworks) {
            const records = await Artwork.find({collectionName: collectionName, _id: { $in: selectedArtworks}}).exec()
            records.forEach((record: any) => sheet.addRow(fillRow(columnNames, record.categories)))
        } else if(exportExtent === "searchResult") {
            const searchText = req.query.searchText
            const queryFilter = searchText ? await constructQuickSearchFilter(searchText, collectionId, collectionName) :
                await constructAdvSearchFilter(req.query, collectionName, false)
            const records = await Artwork.find(queryFilter).exec()
            records.forEach((record: any) => sheet.addRow(fillRow(columnNames, record.categories)))
        } else {
            const records = await Artwork.find({collectionName: collectionName}).exec()
            records.forEach((record: any) => sheet.addRow(fillRow(columnNames, record.categories)))
        }
        
        //cell formatting
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column["eachCell"]!({ includeEmpty: true }, function (cell) {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength ) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength;
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment");

        await workbook.xlsx.write(res)

        res.status(200).end()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Request is missing query params")
            res.status(400).json({ error: err.message })
        else if (err.message === `Collection not found`)
            res.status(404).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}