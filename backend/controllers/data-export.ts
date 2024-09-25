import { Request, Response } from "express"
import excelJS from "exceljs"
import Artwork from "../models/artwork";
import { fillRow, getAllCategories } from "../utils/controllers-utils/data-export"

export const getXlsxWithArtworksData = async (req: Request, res: Response, next: any) => {
    try {
        const collectionName = req.params.collectionName
        const filename = req.query.exportFilename
        const keysToInclude: any = req.query.keysToInclude
        const exportSelectedRecords: any = req.query.exportSelectedRecords
        let selectedArtworks: any = []
        if(exportSelectedRecords === "true" && req.query.selectedArtworks) {
            selectedArtworks = Object.values(req.query.selectedArtworks)
        }

        const workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet("test")

        const records = await Artwork.find({collectionName: collectionName})
        
        const columnNames: Array<any> = []
        
        if(keysToInclude !== undefined) {
            Object.keys(keysToInclude).forEach((k: any) => {
                columnNames.push({header: keysToInclude[k], key: keysToInclude[k]})
            })
        }
        
        sheet.columns = columnNames

        if(exportSelectedRecords === "true") {
            records.forEach((record: any) => {                  
                if(selectedArtworks.includes(record._id.toString())) {
                    sheet.addRow(fillRow(keysToInclude, record.categories))
                }            
            })
        } else {
            records.forEach((record: any) => {
                sheet.addRow(fillRow(keysToInclude, record.categories))         
            })
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
        res.setHeader("Content-Disposition", "attachment; filename=" + filename);

        await workbook.xlsx.write(res)
        res.status(200).end()
    } catch (error) {
        next(error)
    }
}

export const getXlsxWithCollectionData = async (req: Request, res: Response, next: any) => {
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