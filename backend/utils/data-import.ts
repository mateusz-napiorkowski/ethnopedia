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

const prepUploadsDirAndArchiveBuffer = async (zipFile: Express.Multer.File | undefined, collectionId: string) => {
    if(!zipFile) return {}

    const uploadsDir = path.join(__dirname, "..", `uploads/`);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const collectionUploadsDir = path.join(__dirname, "..", `uploads/${collectionId}`);
    if (!fs.existsSync(collectionUploadsDir)) fs.mkdirSync(collectionUploadsDir);

    const archiveBuffer = await unzipper.Open.buffer(zipFile.buffer);

    return {archiveBuffer, collectionUploadsDir}
}

const processArchiveFiles = (
    newRecord: any, archiveBuffer: any, oldRecordId: string, newRecordId: string,
    filenamesCell: string | undefined, collectionUploadsDir: any,
    collectionId: string, zipFile: Express.Multer.File | undefined
) => {
    let uploadedFilenames = []
    let failedUploadsCauses = []
    if(filenamesCell && zipFile) {
        newRecord.files = []
        const maxFileSize = 25 * 1024 * 1024 // 25 MB
        const archiveFilesData = filenamesCell.trim()
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
            const fileEntry = archiveBuffer!.files.find((d: any) => d.path === entry.oldFileName);
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
                    uploadedFilenames.push(entry.oldFileName)
                } catch (error) {
                    const err = error as Error
                    failedUploadsCauses.push({archiveFilename: entry.oldFileName, userFilename: entry.userFilename, cause: err.message})
                }
            } else {
                failedUploadsCauses.push({archiveFilename: entry.oldFileName, userFilename: entry.userFilename, cause: "File not found in the archive"})         
            }
            
        }
    }
    return {uploadedFilenames, uploadedFilesCount: uploadedFilenames.length, failedUploadsCauses}
}

const setRecordCategories = (row: string[], newRecord: any, header: string[]) => {
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
}

export const prepRecordsAndFiles = async (
    data: Array<Array<string>>, collectionName: string,
    asNewCollection: boolean, collectionId: string, zipFile?: Express.Multer.File | undefined
) => {
    try {
        const header = data[0]
            .map(categoryName => categoryName.trim().replace(/\s*\.\s*/g, '.'))
        validateCategories(header, asNewCollection)

        const {collectionUploadsDir, archiveBuffer} = await prepUploadsDirAndArchiveBuffer(zipFile, collectionId)

        const recordsData = data.slice(1)
        const records: Array<record> = []
        const _idColumnIndex = header.indexOf("_id")
        const filenamesColumnIndex = header.indexOf("nazwy plików")
        let totalUploadedFilesCount = 0
        let totalFailedUploadsCauses = []
        let allUploadedFilenames = []
        for(const row of recordsData) {
            const oldRecordId = isValidObjectId(row[_idColumnIndex].trim()) ? row[_idColumnIndex].trim() : undefined;
            const newRecordId = !oldRecordId || asNewCollection 
                ? new mongoose.Types.ObjectId()
                : new mongoose.Types.ObjectId(oldRecordId)
            const newRecord: record = {_id: newRecordId, categories: [], collectionName: collectionName, files: []}

            const {uploadedFilesCount, uploadedFilenames, failedUploadsCauses} = processArchiveFiles(
                newRecord,
                archiveBuffer,
                oldRecordId!,
                newRecordId.toString(),
                filenamesColumnIndex ? row[filenamesColumnIndex] : undefined,
                collectionUploadsDir,
                collectionId,
                zipFile
            )

            setRecordCategories(row, newRecord, header)
            
            records.push(newRecord)
            allUploadedFilenames.push(...uploadedFilenames)
            totalUploadedFilesCount += uploadedFilesCount
            totalFailedUploadsCauses.push(...failedUploadsCauses)
        }
        const allArchiveFilenames = archiveBuffer ? archiveBuffer.files.map(file => file.path) : [];
        const unlistedFiles = allArchiveFilenames.filter(x => !allUploadedFilenames.includes(x))
        for(const file of unlistedFiles) {
            totalFailedUploadsCauses.push({archiveFilename: file, cause: "File is not associated with any record"})
        }
        return {
            records,
            uploadedFilesCount: totalUploadedFilesCount,
            failedUploadsCount: totalFailedUploadsCauses.length,
            failedUploadsCauses: totalFailedUploadsCauses
        }
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