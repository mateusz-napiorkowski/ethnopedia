import Artwork from "../../models/artwork";

interface subcategoryData {
    name: string
    values: Array<string>
    subcategories: Array<subcategoryData>
}

const getNestedCategories = ((prefix: string, subcategories: Array<subcategoryData>) => {
    const nestedCategories: Array<string> = []
    if(subcategories)
        for(const subcategory of subcategories){
            nestedCategories.push(`${prefix}.${subcategory.name}`)
            nestedCategories.push(...getNestedCategories(`${prefix}.${subcategory.name}`, subcategory.subcategories))
        }
    return nestedCategories
})

export const getAllCategories = async (collectionName: string) => {
    try {
        const records = await Artwork.find({ collectionName: collectionName }).exec()
        if(!records)
            throw new Error("Collection not found")
        const allCategories: Array<string> = []
        records.forEach((record:any) => {
            for(const category of record.categories){
                allCategories.push(category.name)
                allCategories.push(...getNestedCategories(`${category.name}`, category.subcategories))
            }
        })
        return [...new Set(allCategories)]
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Collection not found`)
            throw new Error("Collection not found")
        else
            throw new Error("Database unavailable")
    }
    
}