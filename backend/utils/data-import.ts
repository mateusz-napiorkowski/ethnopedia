import mongoose, { isValidObjectId } from "mongoose"
import { getAllCategories } from "./categories"
import { artworkCategory, record } from "./interfaces"

export const prepRecords = async (data: Array<Array<string>>, collectionName: string, asCollection: boolean, collectionId: string | undefined = undefined, idMap: any) => {
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

        const recordsData = data.slice(1)
        const records: Array<record> = []
        for(const rowValues of recordsData) {
            const newRecord: record = {categories: [], collectionName: collectionName}
            rowValues.forEach((rowValueUntrimmed, columnIndex) => {
                const rowValue = rowValueUntrimmed.trim()
                if(header[columnIndex] === "_id") {
                    newRecord._id = isValidObjectId(rowValue)
                        ? (asCollection) ? idMap[rowValue] : new mongoose.Types.ObjectId(rowValue)
                        : new mongoose.Types.ObjectId();
                    return
                } 
                const isNotSubcategoryColumn = header[columnIndex].split(".").length === 1
                if(isNotSubcategoryColumn) {
                    const directSubcategoriesNames = header.filter(columnName => 
                        columnName.startsWith(`${header[columnIndex]}.`) && columnName.split(".").length === 2
                    )
                    newRecord.categories.push({
                        name: header[columnIndex],
                        value: rowValue,
                        subcategories: fillSubcategories(directSubcategoriesNames, 2, header, rowValues)
                    })      
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