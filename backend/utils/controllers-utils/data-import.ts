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
    for(const rowIndex in recordsData) {
        const rowValuesArray = recordsData[rowIndex]
        const newRecord: record = {categories: [], collectionName: collectionName}
        rowValuesArray.forEach((rowValue: string, columnIndex: number) => {
            const isNotSubcategoryColumn = header[columnIndex].split(".").length === 1
            if(isNotSubcategoryColumn) {
                const directSubcategoriesNames = header.filter((columnName: string) => columnName.startsWith(header[columnIndex]) && columnName.split(".").length === 2)
                newRecord.categories.push({
                    name: header[columnIndex],
                    values: rowValue.toString().split(";").filter((value: string) => value !== ""),
                    subcategories: fillSubcategories(2, directSubcategoriesNames, rowValuesArray, header, recordsData, rowIndex)
                })
            }
        });
        records.push(newRecord)
    }
    return records
}

export const fillSubcategories: any = (depth: number, fields: any, allAttrs: any, header: any, recordsData: any, recordIndex: number) => {
    const subs: any = []
    let deeperFields: any = []
    fields.forEach((field: any) => {
        deeperFields = []
        header.forEach((attrName: string) => {
            if(attrName.startsWith(field) && attrName.split(".").length === depth + 1) {
                deeperFields.push(attrName)
            }
        });
        const newSub: subcategoryData = {name: field.split(".").slice(-1)[0],
            values: recordsData[recordIndex][header.indexOf(field)].toString().split(";").filter((i: any) => i !== ""),
            subcategories: []
        }
        if(deeperFields.length !== 0) {
            newSub.subcategories = fillSubcategories(depth + 1, deeperFields, allAttrs, header, recordsData, recordIndex)
        }
        subs.push(newSub)
    });
    return subs
}