import Artwork from "../../models/artwork";

interface subcategoryData {
    name: string
    values: Array<string>
    subcategories: Array<subcategoryData>
}

const findValue: any = (subcategories: Array<subcategoryData>, categoryNameSplitByDot: Array<string>) => {
    const categoryDepth = categoryNameSplitByDot.length
    const [topmostParentCategoryName, ...categoryNameWithoutTopmostPart] = categoryNameSplitByDot;
    if(categoryDepth > 1) {
        const matchingSubcategory = subcategories.find(subcategory => subcategory.name === topmostParentCategoryName);
        return matchingSubcategory ? findValue(matchingSubcategory.subcategories, categoryNameWithoutTopmostPart) : '';
    }
    const matchingCategory = subcategories.find(category => category.name === topmostParentCategoryName);
    return matchingCategory ? matchingCategory.values.join(';') : '';
}

export const fillRow = (keys: Array<string>, categories: Array<subcategoryData>) => {
    const rowdata: any = {}
    keys.forEach(key => {
        rowdata[key] = findValue(categories, key.split("."))
    });
    return rowdata
}

const getNestedCategories = ((prefix: string, subcategories: any) => {
    const nestedCategories: Array<string> = []
    if(subcategories !== undefined) {
        for(const subcategory of subcategories){
            nestedCategories.push(`${prefix}${subcategory.name}`)
            nestedCategories.push(...getNestedCategories(`${prefix}${subcategory.name}.`, subcategory.subcategories))
        }
    }  
    return nestedCategories
})

export const getAllCategories = async (collectionName: any) => {
    const records = await Artwork.find({ collectionName: collectionName }).exec()
    const allCategories: Array<string> = []
    records.forEach((record:any) => {
        for(const category of record.categories){
            allCategories.push(category.name)
            allCategories.push(...getNestedCategories(`${category.name}.`, category.subcategories))
        }
    });
    const allCategoriesUnique = allCategories.filter((value, index, array) => {
        return array.indexOf(value) === index;
    })
    return allCategoriesUnique
}