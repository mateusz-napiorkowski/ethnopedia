import { artworkCategory } from "./interfaces"

const findValue: any = (subcategories: Array<artworkCategory>, categoryNameSplitByDot: Array<string>) => {
    const categoryDepth = categoryNameSplitByDot.length
    const [topmostParentCategoryName, ...categoryNameWithoutTopmostPart] = categoryNameSplitByDot;
    if(categoryDepth > 1) {
        const matchingSubcategory = subcategories.find(subcategory => subcategory.name === topmostParentCategoryName);
        return matchingSubcategory ? findValue(matchingSubcategory.subcategories, categoryNameWithoutTopmostPart) : '';
    }
    const matchingCategory = subcategories.find(category => category.name === topmostParentCategoryName);
    return matchingCategory ? matchingCategory.value : ""
}

export const fillRow = (keys: string[], categories: artworkCategory[], _id?: string, files?: any) => {
    const rowdata: any = {}
    keys.forEach(key => {
        if(key !== "_id" && key !== "nazwy plików")
            rowdata[key] = findValue(categories, key.split("."))
        else if(key === "_id")
            rowdata[key] = _id
        else {
            const filenamesMap = files.map((file: any) => {
                const match = file.newFilename.match(/_(\d+)\./);
                return `${match[1]}:${file.originalFilename}`
            })
            rowdata[key] = filenamesMap.join(';')
        }
    });
    return rowdata
}