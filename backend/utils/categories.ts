import Artwork from "../models/artwork";
import CollectionCollection from "../models/collection";
import { collectionCategory, artworkCategory } from "./interfaces"

export const hasValidCategoryFormat = (categories: Array<collectionCategory>, isRootArray = true): boolean => {
    if(isRootArray && !categories.length)
        return false
    return categories.every(category => 
        category?.name && 
        Array.isArray(category?.subcategories) && 
        hasValidCategoryFormat(category.subcategories, false)
    );
};

export const artworkCategoriesHaveValidFormat = (artworkCategories: Array<artworkCategory>, collectionCategories: Array<collectionCategory>, isRootArray = true): boolean => {
    if (isRootArray && (artworkCategories.length == 0 || collectionCategories.length == 0)) return false;
    if (artworkCategories.length !== collectionCategories.length) return false;

    return collectionCategories.every((category, index) => {
        const artworkCategory = artworkCategories[index];

        return (
            category.name === artworkCategory.name &&
            !!artworkCategory.values &&
            artworkCategoriesHaveValidFormat(artworkCategory.subcategories, category.subcategories, false)
        );
    });
};

const getNestedCategories = ((prefix: string, subcategories: Array<artworkCategory>) => {
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
        const collection = await CollectionCollection.find({name: collectionName}).exec()
        if(collection.length !== 1)
            throw new Error("Collection not found")            
        const records = await Artwork.find({ collectionName: collectionName }).exec()
        
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