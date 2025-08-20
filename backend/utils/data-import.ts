import mongoose, { isValidObjectId } from "mongoose"
import { artworkCategory, record } from "./interfaces"
import path from "path"
import fs from "fs";
import unzipper from "unzipper"

const validateCategories = async (header: string[], asNewCollection: boolean) => {
    if(asNewCollection) {
        const categories = header.filter(categoryName => categoryName.trim() !== "_id" && categoryName.trim() !== "nazwy plików")
        const missingCategories = categories.filter((category: string) => !header.includes(category))
        const unnecessaryCategories = header.filter((category: string) => {
            if(category === "_id" || category === "nazwy plików")
                return false
            return !categories.includes(category)
        })
        if(missingCategories.length != 0 || unnecessaryCategories.length != 0) {
            throw new Error(`Brakujące kategorie: ${missingCategories}, Nadmiarowe kategorie: ${unnecessaryCategories}`)
        }
    }
    if(header.length !== new Set(header).size)
        throw new Error ("Header has duplicate values")
    if(header[header.length - 1] == '')
        throw new Error ("Row contains more columns than the header")
    if(header.includes(""))
        throw new Error (`Header has empty fields`)     
    for(const categoryName of header) {
        const categoryNameSplitByDot = categoryName.split('.')
        if(categoryNameSplitByDot.includes(""))
            throw new Error (`No subcategory name after the dot symbol in header field: ${categoryName}`)
        const directParentCategoryFullName = categoryNameSplitByDot.slice(0,-1).join('.')
        if(categoryNameSplitByDot.length > 1 && !header.includes(directParentCategoryFullName))
            throw new Error (`Missing parent category: '${directParentCategoryFullName}'`)
    }
}

const prepareForUploadFromArchive = async (zipFile: any, collectionId: string) => {
    if(!zipFile) return {}

    const uploadsDir = path.join(__dirname, "..", `uploads/`);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const collectionUploadsDir = path.join(__dirname, "..", `uploads/${collectionId}`);
    if (!fs.existsSync(collectionUploadsDir)) fs.mkdirSync(collectionUploadsDir);

    const archiveBuffer = await unzipper.Open.buffer(zipFile.buffer);

    return {archiveBuffer, collectionUploadsDir}
}

export const prepRecords = async (data: Array<Array<string>>, collectionName: string, asNewCollection: boolean, collectionId: string, zipFile?: any) => {
    try {
        const header = data[0]
            .map(categoryName => categoryName.trim().replace(/\s*\.\s*/g, '.'))
        
        validateCategories(header, asNewCollection)
        const {collectionUploadsDir, archiveBuffer} = await prepareForUploadFromArchive(zipFile, collectionId)
        
        const totalFilesToUpload = archiveBuffer ? archiveBuffer.files.length : 0

        const recordsData = data.slice(1)
        const records: Array<record> = []
        const _idColumnIndex = header.indexOf("_id")
        const filenamesColumnIndex = header.indexOf("nazwy plików")
        let uploadedFilesCount = 0
        let failed = []
        const maxFileSize = 25 * 1024 * 1024 // 25 MB
        for(const row of recordsData) {
            const oldRecordId = isValidObjectId(row[_idColumnIndex].trim()) ? row[_idColumnIndex].trim() : undefined;
            const newRecordId = !oldRecordId || asNewCollection 
                ? new mongoose.Types.ObjectId()
                : new mongoose.Types.ObjectId(oldRecordId)
            const newRecord: record = {_id: newRecordId, categories: [], collectionName: collectionName, files: []}

            if(filenamesColumnIndex && zipFile) {
                newRecord.files = []
                const archiveFilesData = row[filenamesColumnIndex].trim()
                    .split(";")
                    .filter(Boolean)
                    .map(item => {
                        const [index, filename] = item.split(":");
                        const ext = path.extname(filename);
                        const newFilename = `${newRecordId.toString()}_${index}${ext}`
                        return {
                            oldFileName: `${oldRecordId}_${index}${ext}`,
                            newFilename: newFilename,
                            userFilename: filename
                        };
                    });
                for(const entry of archiveFilesData) {
                    const fileEntry = archiveBuffer!.files.find(d => d.path === entry.oldFileName);
                    if(fileEntry) {
                        try {
                            if(!/\.(mei|mid|midi|txt|text|musicxml|mxl|xml|wav|mp3)$/i.test(entry.oldFileName))
                                throw Error("Invalid file extension")
                            if(fileEntry.uncompressedSize > maxFileSize)
                                throw Error("File size exceeded")
                            const outputPath = path.join(collectionUploadsDir!, entry.newFilename);
                            const writeStream = fs.createWriteStream(outputPath);
                            fileEntry.stream().pipe(writeStream);
                            const fileProps = {
                                originalFilename: entry.userFilename,
                                newFilename: entry.newFilename,
                                filePath: `uploads/${collectionId}/${entry.newFilename}`,
                                size: fileEntry?.uncompressedSize,
                                uploadedAt: Date.now()
                            }
                            newRecord.files.push(fileProps)
                            uploadedFilesCount++;
                        } catch (error) {
                            const err = error as Error
                            failed.push({archiveFilename: entry.oldFileName, userFilename: entry.userFilename, cause: err.message})
                        }
                    } else {
                        failed.push({archiveFilename: entry.oldFileName, userFilename: entry.userFilename, cause: "File not found in the archive"})         
                    }
                    
                }
            }

            row.forEach((categoryValueUntrimmed, columnIndex) => {
                if(header[columnIndex] !== "_id" && header[columnIndex] !== "nazwy plików") {
                    const categoryValue = categoryValueUntrimmed.trim()
                    const isNotSubcategoryColumn = header[columnIndex].split(".").length === 1
                    if(isNotSubcategoryColumn) {
                        const directSubcategoriesNames = header.filter(columnName => 
                            columnName.startsWith(`${header[columnIndex]}.`) && columnName.split(".").length === 2
                        )
                        newRecord.categories.push({
                            name: header[columnIndex],
                            value: categoryValue,
                            subcategories: fillSubcategories(directSubcategoriesNames, 2, header, row)
                        })      
                    }
                }  
            });
            records.push(newRecord)
        }
        return {records, uploadedFilesCount, failedUploadsCount: failed.length, failedUploadsCauses: failed, unlistedFilesCount: totalFilesToUpload-uploadedFilesCount-failed.length}
    } catch (error) {
        throw new Error("Invalid data in the spreadsheet file", {cause: error})
    }
    
}

const fillSubcategories = (fields: Array<string>, depth: number, header: Array<string>, rowValues: Array<string>) => {
    const subcategories: Array<artworkCategory> = []
    fields.forEach(field => {
        const allSubcategoriesNames = header.filter(columnName => (columnName.startsWith(`${field}.`)))
        const directSubcategoriesNames = allSubcategoriesNames.filter(columnName => columnName.split(".").length === depth + 1)
        subcategories.push({
            name: field.split(".").slice(-1)[0],
            value: rowValues[header.indexOf(field)].trim(),
            subcategories: fillSubcategories(directSubcategoriesNames, depth + 1, header, rowValues)
        })        
    });
    return subcategories
}