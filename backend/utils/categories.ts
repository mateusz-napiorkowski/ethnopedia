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
            !!artworkCategory.value &&
            artworkCategoriesHaveValidFormat(artworkCategory.subcategories, category.subcategories, false)
        );
    });
};

export const isValidCollectionCategoryStructureForCollectionUpdate = (artworkSubcategories: Array<artworkCategory>, collectionSubcategories: Array<collectionCategory>): boolean => {
    if(artworkSubcategories.length > collectionSubcategories.length) return false
    return artworkSubcategories.every((artworkCategory, index) =>
        isValidCollectionCategoryStructureForCollectionUpdate(
          artworkCategory.subcategories,
          collectionSubcategories[index].subcategories
        )
      );
}

const getNestedCategories = ((prefix: string, subcategories: Array<artworkCategory>) => {
    const nestedCategories: Array<string> = []
    for(const subcategory of subcategories) {
        nestedCategories.push(`${prefix}.${subcategory.name}`)
        nestedCategories.push(...getNestedCategories(`${prefix}.${subcategory.name}`, subcategory.subcategories))
    }
    return nestedCategories
})

export const getAllCategories = async (collectionName: string) => {
    try {
        const collections = await CollectionCollection.find({name: collectionName}).exec()
        if(collections.length !== 1)
            throw new Error("Collection not found")
        const allCategories: Array<string> = []
        for(const category of collections[0].categories) {
            allCategories.push(category.name)
            allCategories.push(...getNestedCategories(`${category.name}`, category.subcategories))
        }           
        return allCategories
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === `Collection not found`)
            throw new Error("Collection not found")
        else
            throw new Error("Database unavailable")
    }
}

export const transformCategoriesArrayToCategoriesObject = (categoriesArray: Array<string>, depth = 1) => {
    const categories: Array<any> = []
    categoriesArray.forEach(field => {
        const allSubcategoriesNames = categoriesArray
            .filter(columnName => (columnName.startsWith(`${field}.`)))
            .map(item => item.split('.').slice(1).join('.'));
        if(!field.includes("."))
            categories.push({
                name: field,
                subcategories: transformCategoriesArrayToCategoriesObject(allSubcategoriesNames, depth + 1)
            })        
    })
    return categories
}

export const findMissingParentCategories = ((categoriesArray: Array<string>) => {
    const missingCategories: Array<string> = []
    categoriesArray.forEach((category: string) => {
        const parentCategory = category.split(".").slice(0, -1).join(".")
        if(category.includes(".") && !categoriesArray.includes(parentCategory))
            missingCategories.push(parentCategory)
    });
    return missingCategories
})