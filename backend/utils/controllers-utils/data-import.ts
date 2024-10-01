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
    for(const recordIndex in recordsData) {
        const recordAttrs = recordsData[recordIndex]
        const newRecord: record = {categories: [], collectionName: collectionName}
        const depth = 1
        const categories: any = newRecord.categories
        recordAttrs.forEach((cellVal: any, attrIndex: number) => {
            if(header[attrIndex].split(".").length === depth) {
                const fields: any = []
                header.forEach((element: any) => {
                    if(element.startsWith(header[attrIndex]) && element.split(".").length === depth + 1) {
                        fields.push(element)
                    }
                });
                const newCaterory: subcategoryData = {
                    name: header[attrIndex], 
                    values: recordAttrs[attrIndex].toString().split(";").filter((i: any) => i !== ""),
                    subcategories: []
                }
                if(fields.length !== 0) {
                    newCaterory.subcategories = fillSubcategories(depth + 1, fields, recordAttrs, header, recordsData, recordIndex)
                }
                categories.push(newCaterory)
            }
        });
        records.push(newRecord)
    }
    console.log(records)
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