export interface subData {
    name: string
    values: string
    subcategories: Array<any>,
    isSelectable: boolean
}

export const fillSubcategories: any = (depth: number, fields: any, allAttrs: any, header: any, recordsData: any, recordIndex: number) => {
    let subs: any = []
    let deeperFields: any = []
    fields.forEach((field: any) => {
        deeperFields = []
        header.forEach((attrName: string, elementIndex: number) => {
            if(attrName.startsWith(field) && attrName.split(".").length === depth + 1) {
                deeperFields.push(attrName)
            }
        });
        let newSub: subData = {name: field.split(".").slice(-1)[0],
            values: recordsData[recordIndex][header.indexOf(field)].toString().split(";").filter((i: any) => i !== ""),
            subcategories: [],
            isSelectable: false
        }
        if(deeperFields.length !== 0) {
            newSub.subcategories = fillSubcategories(depth + 1, deeperFields, allAttrs, header, recordsData, recordIndex)
        }
        subs.push(newSub)
    });
    return subs
}

module.exports = { fillSubcategories }