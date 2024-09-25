export interface subData {
    name: string
    values: string
    subcategories: Array<any>
}

export const prepRecords: any = (data: any, collectionName: any) => {
    const header = data[0]
    const recordsData = data.slice(1)
    const headerAttrsInArrays: any = []
    header.forEach((attr:string) => {
        headerAttrsInArrays.push(attr.split("."))
    })

    const records: Array<[]> = []
    for(const recordIndex in recordsData) {
        const recordAttrs = recordsData[recordIndex]
        const newRecord: any = {categories: []}
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
                const newCaterory: subData = {
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
        newRecord.collectionName = collectionName
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
        const newSub: subData = {name: field.split(".").slice(-1)[0],
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