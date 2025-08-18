import mongoose, { isValidObjectId } from "mongoose"
import { getAllCategories } from "./categories"
import { artworkCategory, record } from "./interfaces"
import path from "path"
import fs from "fs";
import unzipper from "unzipper"

export const prepRecords = async (data: Array<Array<string>>, collectionName: string, asCollection: boolean, collectionId: string | undefined = undefined, idMap: any, zipFile?: any) => {
    try {
        const header = data[0]
            .map(categoryName => categoryName.trim().replace(/\s*\.\s*/g, '.'))
        const categories = (asCollection) 
            ? data[0]
                .filter(categoryName => categoryName.trim() !== "_id")
                .map(categoryName => categoryName.trim().replace(/\s*\.\s*/g, '.'))
            : await getAllCategories([collectionId!])
        const missingCategories = categories.filter((category: string) => !header.includes(category))
        const unnecessaryCategories = header.filter((category: string) => {
            if(category === "_id")
                return false
            return !categories.includes(category)
        })
        if(missingCategories.length != 0 || unnecessaryCategories.length != 0) {
            throw new Error(`Brakujące kategorie: ${missingCategories}, Nadmiarowe kategorie: ${unnecessaryCategories}`)
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

        let archiveBuffer;
        let collectionUploadsDir;
        if(zipFile) {
            const uploadsDir = path.join(__dirname, "..", `uploads/`);
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
            collectionUploadsDir = path.join(__dirname, "..", `uploads/${collectionId}`);
            if (!fs.existsSync(collectionUploadsDir)) fs.mkdirSync(collectionUploadsDir);
            archiveBuffer = await unzipper.Open.buffer(zipFile.buffer);
        }
        

        const recordsData = data.slice(1)
        const records: Array<record> = []
        const _idColumnIndex = header.indexOf("_id")
        const filenamesColumnIndex = header.indexOf("nazwy plików")
        for(const row of recordsData) {
            const newRecord: record = {categories: [], collectionName: collectionName, files: []}

            let oldRecordId = isValidObjectId(row[_idColumnIndex].trim()) ? row[_idColumnIndex].trim() : undefined;
            newRecord._id = oldRecordId
                ? ((asCollection) ? idMap[oldRecordId] : new mongoose.Types.ObjectId(oldRecordId))
                : new mongoose.Types.ObjectId();

            if(filenamesColumnIndex && zipFile) {
                newRecord.files = []
                const archiveFilesData = row[filenamesColumnIndex].trim()
                    .split(";")
                    .filter(Boolean)
                    .map(item => {
                        const [index, filename] = item.split(":");
                        const ext = path.extname(filename);
                        const newFilename = `${idMap[oldRecordId!].toString()}_${index}${ext}`
                        return {
                            oldFileName: `${oldRecordId}_${index}${ext}`,
                            newFilename: newFilename,
                            userFilename: filename
                        };
                    });
                for(const entry of archiveFilesData) {
                    const fileEntry = archiveBuffer!.files.find(d => d.path === entry.oldFileName);
                    if(fileEntry) {
                        const fileProps = {
                            originalFilename: entry.userFilename,
                            newFilename: entry.newFilename,
                            filePath: `uploads/${collectionId}/${entry.newFilename}`,
                            size: fileEntry?.uncompressedSize,
                            uploadedAt: Date.now()
                        }
                        const outputPath = path.join(collectionUploadsDir!, entry.newFilename);
                        const writeStream = fs.createWriteStream(outputPath);
                        fileEntry.stream().pipe(writeStream);
                        newRecord.files.push(fileProps)
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
        return records
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

export const getNewRecordIdsMap = (importData: Array<Array<string>>) => {
    const _idColumnIndex = importData[0].indexOf("_id")
    const mapping: any = {}
    for(const row of importData.slice(1)) {
        if(isValidObjectId(row[_idColumnIndex]))
            mapping[row[_idColumnIndex]] = new mongoose.Types.ObjectId()    
    }
    return mapping
}

export const handleFilesUnzipAndUpload = async (zipFile: any, collectionId: string, idMap: any) => {
    console.log("AAAAAAAAAAAAAAAAAAAa")
    const uploadsDir = path.join(__dirname, "..", `uploads/`);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const collectionUploadsDir = path.join(__dirname, "..", `uploads/${collectionId}`);
    if (!fs.existsSync(collectionUploadsDir)) fs.mkdirSync(collectionUploadsDir);
    const archiveBuffer = await unzipper.Open.buffer(zipFile.buffer);
    const fileEntry = archiveBuffer.files.find(d => d.path === "6899b9f375550769e12ed081_0.mei");
    if (fileEntry) {
        const contentBuffer = await fileEntry.buffer();
        console.log(contentBuffer.toString());
        const outputPath = path.join("/your/output/directory", path.basename(fileEntry.path));
        const writeStream = fs.createWriteStream(outputPath);

        // Pipe the file stream to disk
        fileEntry.stream().pipe(writeStream);
    }

    // const bufferStream = Readable.from(zipFile.buffer);
    // const stream = bufferStream.pipe(unzipper.Parse({ forceStream: true }));
    // for await (const entry of stream) {
    //     const fileName = entry.path;
    //     const type = entry.type;
    //     if (type === "File") {
    //         const [_, inputFileId, suffix] = fileName.match(/^([a-f0-9]+)(_.*)$/);
    //         if(idMap[inputFileId]) {
    //             const targetPath = path.join(collectionUploadsDir, path.basename(`${idMap[inputFileId].toString()}${suffix}`));
    //             entry.pipe(fs.createWriteStream(targetPath));
    //             console.log(`Extracted: ${fileName} -> ${targetPath}`);
    //         }      
    //     } else {
    //         entry.autodrain();
    //     }
    // }
}