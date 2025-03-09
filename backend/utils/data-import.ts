import { getAllCategories } from "./categories"
import { artworkCategory, record } from "./interfaces"

export const prepRecords = async (data: Array<Array<string>>, collectionName: string, asCollection: boolean) => {
    try {
        const header = data[0].map(categoryName => categoryName.trim().replace(/\s*\.\s*/g, '.'))
        const categories = asCollection ? data[0] : await getAllCategories(collectionName)
        let missingCategories = categories.filter((category: string) => !header.includes(category))
        let unnecessaryCategories = header.filter((category: string) => !categories.includes(category))
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
            rowValues.forEach((rowValue, columnIndex) => {
                const isNotSubcategoryColumn = header[columnIndex].split(".").length === 1
                const cellValues = rowValue.toString().split(";").map(value => value.trim()).filter(value => value !== "")
                if(isNotSubcategoryColumn) {
                    const directSubcategoriesNames = header.filter(columnName => 
                        columnName.startsWith(`${header[columnIndex]}.`) && columnName.split(".").length === 2
                    )
                    newRecord.categories.push({
                        name: header[columnIndex],
                        values: cellValues,
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
        const subcategoryValues = rowValues[header.indexOf(field)].toString().split(";").map(value => value.trim()).filter(value => value !== "")
        subcategories.push({
            name: field.split(".").slice(-1)[0],
            values: subcategoryValues,
            subcategories: fillSubcategories(directSubcategoriesNames, depth + 1, header, rowValues)
        })        
    });
    return subcategories
}