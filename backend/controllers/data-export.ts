import { Request, Response } from "express"
import excelJS from "exceljs"
import Artwork from "../models/artwork";
import { fillRow } from "../utils/data-export"
import { getAllCategories } from "../utils/categories";
import { constructAdvSearchFilter, constructQuickSearchFilter } from "../utils/artworks";
import CollectionCollection from "../models/collection";
import archiver from "archiver";
import path from "path";

export const getXlsxWithCollectionData = async (req: Request, res: Response) => {
    try {
        const collectionId = req.params.collectionId
        const collection = await CollectionCollection.findOne({_id: collectionId}).exec()
        if (collection == null)
            throw new Error(`Collection not found`)
        const collectionName = collection?.name as string

        const workbook = new excelJS.Workbook()
        const worksheetName = collectionName.slice(0, 31)
        const sheet = workbook.addWorksheet(worksheetName)

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
        const includeIds = req.query.includeIds === "true"
        const includeFilenames = req.query.includeFilenames === "true"
        const exportAsCSV = req.query.exportAsCSV === "true"
        const collectionIds = req.query.collectionIds

        const columnNames = typeof req.query.columnNames === "string"
            ? [
                ...(includeIds ? ["_id"] : []),
                ...(includeFilenames ? ["nazwy plików"] : []),
                ...Array(req.query.columnNames)
              ]
            : [
                ...(includeIds ? ["_id"] : []),
                ...(includeFilenames ? ["nazwy plików"] : []),
                ...(req.query.columnNames
                    ? (req.query.columnNames as string[])
                    : []
                )
              ]

        const exportExtent = req.query.exportExtent
        if(!columnNames || columnNames.length === 0 || !exportExtent || !collectionIds)
            throw new Error("Request is missing query params")

        const collections = await CollectionCollection.find({_id: {$in: collectionIds}}).exec()

        if (collections.length === 0)
            throw new Error(`Collection not found`)
        const collectionNames = collections.map(collection => collection.name as string);

        const workbook = new excelJS.Workbook()
        const worksheetName = collectionNames.length === 1 ? collectionNames[0].slice(0, 31) : "Arkusz1"
        const sheet = workbook.addWorksheet(worksheetName)
        sheet.columns = columnNames.map((name: string) => {return {header: name, key: name}})

        const selectedArtworks = req.query.selectedArtworks
        if(exportExtent === "selected" && !selectedArtworks) {    
            throw new Error("Request is missing query params")
        } else if(exportExtent === "selected" && selectedArtworks) {
            const records = await Artwork.find({collectionName: {$in: collectionNames}, _id: { $in: selectedArtworks}}).exec()
            records.forEach((record: any) => sheet.addRow(
                fillRow(
                    columnNames, record.categories,
                    includeIds ? record._id.toString() : undefined,
                    includeFilenames ? record.files : undefined
                )
            ))
        } else if(exportExtent === "searchResult") {
            const searchText = req.query.searchText
            const queryFilter = searchText ? await constructQuickSearchFilter(searchText, collectionIds as Array<string>, collectionNames) :
                await constructAdvSearchFilter(req.query, collectionNames, false)
            const records = await Artwork.find(queryFilter).exec()
            records.forEach((record: any) => sheet.addRow(
                fillRow(
                    columnNames, record.categories,
                    includeIds ? record._id.toString() : undefined,
                    includeFilenames ? record.files : undefined
                )
            ))
        } else {
            const records = await Artwork.find({collectionName: {$in: collectionNames}}).exec()
            records.forEach((record: any) => sheet.addRow(
                fillRow(
                    columnNames, record.categories,
                    includeIds ? record._id.toString() : undefined,
                    includeFilenames ? record.files : undefined
                )
            ))
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

        if(exportAsCSV)
            await workbook.csv.write(res)
        else
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

export const getArtworksFilesArchive = async (req: Request, res: Response) => {
    try {
        const collectionIds = req.query.collectionIds
        const exportExtent = req.query.exportExtent
        if(!exportExtent || !collectionIds)
            throw new Error("Request is missing query params")

        const collections = await CollectionCollection.find({_id: {$in: collectionIds}}).exec()
        if (collections.length === 0)
            throw new Error(`Collection not found`)
        const collectionNames = collections.map(collection => collection.name as string);

        let records;
        const selectedArtworks = req.query.selectedArtworks
        if(exportExtent === "selected" && !selectedArtworks) {    
            throw new Error("Request is missing query params")
        } else if(exportExtent === "selected" && selectedArtworks) {
            records = await Artwork.find({collectionName: {$in: collectionNames}, _id: { $in: selectedArtworks}}).exec()
        } else if(exportExtent === "searchResult") {
            const searchText = req.query.searchText
            const queryFilter = searchText ? await constructQuickSearchFilter(searchText, collectionIds as Array<string>, collectionNames) :
                await constructAdvSearchFilter(req.query, collectionNames, false)
            records = await Artwork.find(queryFilter).exec()
        } else {
            records = await Artwork.find({collectionName: {$in: collectionNames}}).exec()
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment');

        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', err => {
            throw new Error("Error creating archive")
        });

        archive.pipe(res)

        for(const record of records) {
            for(const file of record.files) {
                const fileDir = path.join(__dirname, "..", file.filePath as string);
                archive.file(fileDir, { name: file.newFilename as string });
            }
        }

        archive.finalize()
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Request is missing query params")
            res.status(400).json({ error: err.message })
        else if (err.message === "Collection not found")
            res.status(404).json({ error: err.message })
        else if (err.message === "Error creating archive")
            res.status(500).json({ error: err.message })
        else
            res.status(503).json({ error: `Database unavailable` })
    }
}