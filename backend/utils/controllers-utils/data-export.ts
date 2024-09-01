const Artwork = require("../../models/artwork")

export const fillRow: any = (keys: any, categories: any) => {
    let rowdata: any = {}
    keys.forEach((key: any) => {
        rowdata[key] = findValue(categories, key.split("."))
    });
    return rowdata
}

const findValue: any = (subcategories: any, keySplit: any) => {
    let v: string | undefined = undefined
    const categoryDepth = keySplit.length
    if(categoryDepth > 1) {
        const categoryPrefix = keySplit[0]
        for(const subcategory of subcategories) {
            if(subcategory.name == categoryPrefix) {
                v = findValue(subcategory.subcategories, keySplit.slice(1))
                if(v !== undefined) return v
            }
        }
    } else if (categoryDepth == 1) {
        if(subcategories !== undefined) {
            for(const subcategory of subcategories) {
                if(subcategory.name == keySplit[0]) {
                    let v_temp: Array<string> = []
                    for(const subcategoryValue of subcategory.values) {
                        v_temp.push(subcategoryValue)
                    }
                    return v_temp.join(";")
                }
            }
        }  
    }
    return ""
}

const getNestedKeys = ((prefix: string, subcategories: any) => {
    let nestedCategories: Array<string> = []
    if(subcategories !== undefined) {
        for(const subcategory of subcategories){
            nestedCategories.push(`${prefix}${subcategory.name}`)
            nestedCategories.push(...getNestedKeys(`${prefix}${subcategory.name}.`, subcategory.subcategories))
        }
    }  
    return nestedCategories
})

export const getAllKeys = async (collectionName: any) => {
    const records = await Artwork.find({ collectionName: collectionName })
    let allCategories: Array<string> = []
    records.forEach((record:any) => {
        for(const category of record.categories){
            allCategories.push(category.name)
            allCategories.push(...getNestedKeys(`${category.name}.`, category.subcategories))
        }
    });
    const allCategoriesUnique = allCategories.filter((value, index, array) => {
        return array.indexOf(value) === index;
    })
    return allCategoriesUnique
}

module.exports = { fillRow, getAllKeys}