import { Request, Response } from "express"
import excelJS from "exceljs"
import Artwork from "../models/artwork";
import { fillRow, getAllCategories } from "../utils/controllers-utils/data-export"

export const getXlsxWithArtworksData = async (req: Request, res: Response) => {
    try {
        const collectionName = req.params.collectionName
        const columnNames = req.query.columnNames as Array<string>
        const exportSelectedRecords = req.query.exportSelectedRecords
        if(!columnNames || !exportSelectedRecords)
            throw new Error("Request is missing query params")

        const workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet(collectionName)
        sheet.columns = columnNames.map((name: string) => {return {header: name, key: name}})

        const selectedArtworks = req.query.selectedArtworks
        if(exportSelectedRecords === "true" && !selectedArtworks) {    
            throw new Error("Request is missing query params")
        } else if(exportSelectedRecords === "true" && selectedArtworks) {
            const records = await Artwork.find({collectionName: collectionName, _id: { $in: selectedArtworks}}).exec()
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
        else if (err.message === `Error preparing data for xlsx file`)
            res.status(500).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}

export const getXlsxWithCollectionData = async (req: Request, res: Response) => {
    try {
        const collectionName = req.params.collectionName
        const workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet(collectionName)

        const columnNames = await getAllCategories(collectionName)
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
        if (err.message === `Error preparing data for xlsx file`)
            res.status(500).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}