import Artwork from "../../models/artwork";

export const fillRow: any = (keys: any, categories: any) => {
    const rowdata: any = {}
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
                    const v_temp: Array<string> = []
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
    const records = await Artwork.find({ collectionName: collectionName })
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