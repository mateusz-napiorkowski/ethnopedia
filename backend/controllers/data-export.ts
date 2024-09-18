import { Request, Response } from "express"
import excelJS from "exceljs"
import Artwork from "../models/artwork";
import { fillRow, getAllKeys } from "../utils/controllers-utils/data-export"

export const getXlsxWithArtworksData = async (req: Request, res: Response, next: any) => {
    try {
        const collectionName = decodeURIComponent(req.params.collectionName)
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
        
        res.end()
    } catch (error) {
        next(error)
    }
}

export const getXlsxWithCollectionData = async (req: Request, res: Response, next: any) => {
    try {
        const collectionName = decodeURIComponent(req.params.collectionName)
        const workbook = new excelJS.Workbook()
        const sheet = workbook.addWorksheet("test")

        const records = await Artwork.find({collectionName: collectionName})

        const columnNames: Array<any> = []      
        const keysUnique = await getAllKeys(collectionName)
        keysUnique.forEach((k: any) => {
            columnNames.push({header: k, key: k})
        })
        sheet.columns = columnNames

        records.forEach((record: any) => {
            sheet.addRow(fillRow(keysUnique, record.categories))         
        })
        
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
        res.setHeader("Content-Disposition", "attachment; filename=" + "test.xlsx");

        await workbook.xlsx.write(res)
        
        res.end()
    } catch (error) {
        next(error)
    }
}