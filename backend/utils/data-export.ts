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

export const fillRow = (keys: Array<string>, categories: Array<artworkCategory>) => {
    const rowdata: any = {}
    keys.forEach(key => {
        rowdata[key] = findValue(categories, key.split("."))
    });
    return rowdata
}