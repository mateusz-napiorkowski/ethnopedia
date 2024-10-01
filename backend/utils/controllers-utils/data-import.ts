interface subcategoryData {
    name: string
    values: Array<string>
    subcategories: Array<subcategoryData>
}

interface record {
    categories: Array<subcategoryData>,
    collectionName: string
}

export const prepRecords = (data: Array<Array<string>>, collectionName: string) => {
    const header = data[0]
    const recordsData = data.slice(1)
    const records: Array<record> = []
    for(const rowValues of recordsData) {
        const newRecord: record = {categories: [], collectionName: collectionName}
        rowValues.forEach((rowValue: string, columnIndex: number) => {
            const isNotSubcategoryColumn = header[columnIndex].split(".").length === 1
            if(isNotSubcategoryColumn) {
                const directSubcategoriesNames = header.filter((columnName: string) => 
                    columnName.startsWith(header[columnIndex]) && columnName.split(".").length === 2
                )
                newRecord.categories.push({
                    name: header[columnIndex],
                    values: rowValue.toString().split(";").filter((value: string) => value !== ""),
                    subcategories: fillSubcategories(directSubcategoriesNames, 2, header, rowValues)
                })
            }
        });
        records.push(newRecord)
    }
    return records
}

export const fillSubcategories = (fields: Array<string>, depth: number, header: Array<string>, rowValues: Array<string>) => {
    const subcategories: Array<subcategoryData> = []
    fields.forEach((field: string) => {
        const directSubcategoriesNames = header.filter((columnName: string) => columnName.startsWith(field) && columnName.split(".").length === depth + 1)
        subcategories.push({name: field.split(".").slice(-1)[0],
            values: rowValues[header.indexOf(field)].toString().split(";").filter((value: string) => value !== ""),
            subcategories: fillSubcategories(directSubcategoriesNames, depth + 1, header, rowValues)
        })
    });
    return subcategories
}