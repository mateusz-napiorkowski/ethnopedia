import mongoose, { ClientSession, SortOrder } from "mongoose";
import { getAllCategories } from "./categories";
import { artworkCategory, collectionCategory } from "./interfaces";
import path from "path"
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

export const updateArtworkCategories = (artworkSubcategories: Array<artworkCategory>, collectionSubcategories: Array<collectionCategory>) => {
    const newArtworkCategories: Array<artworkCategory> = []
    for(const [categoryIndex, category] of collectionSubcategories.entries()) {
        newArtworkCategories.push({
            name: category.name,
            value: artworkSubcategories[categoryIndex] ? artworkSubcategories[categoryIndex].value : "",
            subcategories: updateArtworkCategories(
                artworkSubcategories[categoryIndex] ? artworkSubcategories[categoryIndex].subcategories : [],
                collectionSubcategories[categoryIndex].subcategories
            )
        })
    }
    return newArtworkCategories
}

const fillSubcategoriesFilterPart: any = (searchText: string, currentDepth: number, maxDepth: number) => {
    if (maxDepth === 0) return []

    const wordsToMatch = searchText
        .split(/\s+/)
        .filter(Boolean)
        .map(word => new RegExp(`(^|\\s)${word}($|\\s)`, 'i'));

    return {
        $elemMatch: {
            $or: currentDepth === maxDepth 
                ? [{ $and: wordsToMatch.map(regex => ({ value: regex })) } ] 
                : [
                    { $and: wordsToMatch.map(regex => ({ value: regex })) },
                    { subcategories: fillSubcategoriesFilterPart(searchText, currentDepth + 1, maxDepth) }
                ]
        }
    }
}

export const constructQuickSearchFilter = async (searchText: any, collectionIds: Array<string>, collectionNames: Array<string>) => {
    const allCategories = await getAllCategories(collectionIds)
    const maxDepth = allCategories.length > 0 ?
        Math.max.apply(Math, allCategories.map((category) => category.split('.').length)) : 0
    const queryFilter = {
        collectionName: {$in: collectionNames},
        categories: fillSubcategoriesFilterPart(searchText, 1, maxDepth)
    }
    return queryFilter
}

const constructAdvSearchSubcategoriesFilter = (searchRules: Array<Array<string>>, depth: number) => {
    const subcategoryFilter: any = {$all: []}
    searchRules.forEach(([subcategoryName, subcategoryValue]) => {
        const subcategoryNameSplitByDot = subcategoryName.split('.');
        const isCurrentDepthSubcategory = subcategoryNameSplitByDot.length === depth;
        if (!isCurrentDepthSubcategory) return

        const deeperSubcategoriesSearchRules = searchRules.filter(([deeperSubcategoryName]) => 
            deeperSubcategoryName.startsWith(`${subcategoryName}.`)
        );

        const newFilterPart: any = {
            $elemMatch: {
                name: subcategoryNameSplitByDot.slice(depth - 1).join('.')
            }
        };

        if(subcategoryValue) {
            const wordsToMatch = subcategoryValue
                .split(/\s+/)
                .filter(Boolean)
                .map(word => new RegExp(`(^|\\s)${word}($|\\s)`, 'i'));
            newFilterPart.$elemMatch.$and = wordsToMatch.map(regex => ({ value: regex }))
        }
            

        if(deeperSubcategoriesSearchRules.length != 0)
            newFilterPart.$elemMatch.subcategories = constructAdvSearchSubcategoriesFilter(deeperSubcategoriesSearchRules, depth + 1)

        subcategoryFilter.$all.push(newFilterPart)
    })
    return subcategoryFilter
}

export const constructTopmostCategorySearchTextFilter = (searchText: string) => {
    return {
        categories: {
            $elemMatch: {
                value: new RegExp(`^${searchText}$`, 'i')
            }
        }
    }
}

const getOnlySearchRulesArray = (reqQuery: any, forArtworkPage = true) => {
    const rulesArray: any = []
    const keywordsToSkip = forArtworkPage ? ["page", "pageSize", "sortOrder", "search", "collectionIds", "sortBy"] : ["columnNames", "selectedArtworks", "exportExtent", "collectionIds"]
    for(const categoryName in reqQuery) {
        if(!keywordsToSkip.includes(categoryName)) {
            rulesArray.push([categoryName, reqQuery[categoryName]])
            const categoryNameSplitByDot = categoryName.split('.')
            while(categoryNameSplitByDot.length !== 1) {
                categoryNameSplitByDot.pop()
                if(!reqQuery.hasOwnProperty(categoryNameSplitByDot.join('.'))) {
                    rulesArray.push([categoryNameSplitByDot.join('.'), undefined])
                }
            }
        }
    }
    return rulesArray
}

export const constructAdvSearchFilter = (requestQuery: any, collectionNames: Array<string>, forArtworkPage = true) => {
    const searchRules = getOnlySearchRulesArray(requestQuery, forArtworkPage)

    const queryFilter: any = {
        collectionName: {$in: collectionNames},
        categories: {$all: []}
    }

    searchRules.forEach(([categoryName, categoryValue]: [string, any]) => {
        if(categoryName.includes('.')) return //skip subcategory search rules

        const currentCategorySubcategoriesSearchRules = searchRules.filter(([subcategoryName]: [string, any]) => 
            subcategoryName.startsWith(`${categoryName}.`)
        );

        const categoryFilter: any = { 
            $elemMatch: { 
                name: categoryName
            }
        };

        if(categoryValue) {
            const wordsToMatch = categoryValue
                .split(/\s+/)
                .filter(Boolean)
                .map((word: string) => new RegExp(`(^|\\s)${word}($|\\s)`, 'i'));
            categoryFilter.$elemMatch.$and = wordsToMatch.map((regex: any) => ({ value: regex }))
        }
        
        if(currentCategorySubcategoriesSearchRules.length > 0)
            categoryFilter.$elemMatch.subcategories = constructAdvSearchSubcategoriesFilter(currentCategorySubcategoriesSearchRules, 2);

        queryFilter.categories.$all.push(categoryFilter);
    })
    return queryFilter
}

const findMatchingCategory: any = (categoryFullName: string, record: any) => {
    const categoriesList = record.categories ? record.categories : record.subcategories
    const [topmostParentCategoryName, ...categoryNameWithoutTopmostPart] = categoryFullName.split(".");

    const matchedObject = categoriesList.find((category: any) => category.name === topmostParentCategoryName);
    if (!matchedObject) return undefined;

    return categoryNameWithoutTopmostPart.length === 0
        ? matchedObject
        : findMatchingCategory(categoryNameWithoutTopmostPart.join("."), matchedObject);
}

export const sortRecordsByCategory = (records: any, categoryToSortBy: string, ascOrDesc: SortOrder) => {
    if(["createdAt", "updatedAt"].includes(categoryToSortBy))
        return records

    const recordAndCategoryValuePairs = records.map((record: any) => {
        const matchingCategory = findMatchingCategory(categoryToSortBy, record)
        const categoryValue = matchingCategory ? matchingCategory.value : null;
        return [record, categoryValue];
    })
    .sort((a: any, b: any) => {
        if (a[1] && b[1])
            return a[1].toString().toUpperCase().localeCompare(b[1].toString().toUpperCase())
        
        //records which have the category to sort by come first
        if (a[1]) return -1;
        if (b[1]) return 1;
    });    
    
    const sortedRecords = recordAndCategoryValuePairs.map((pair: any) => pair[0]);
    if(ascOrDesc == "desc")
        return sortedRecords.reverse()
    return sortedRecords
}

export const handleFileUpload = async (artwork: any, files: Express.Multer.File[] | undefined, collectionId: mongoose.Types.ObjectId, session: ClientSession) => {
    const savedFiles = [];
    const failed = []
    if (files && Array.isArray(files)) {
        const uploadsDir = path.join(__dirname, "..", `uploads/`);
        const collectionUploadsDir = path.join(__dirname, "..", `uploads/${collectionId}`);
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
        if (!fs.existsSync(collectionUploadsDir)) fs.mkdirSync(collectionUploadsDir);

        for(const file of files) {
            const fileName = `${artwork._id}-${uuidv4()}${path.extname(file.originalname)}`;
            const filePath = `uploads/${collectionId}/${fileName}`;

            const maxFileSize = 25 * 1024 * 1024 // 25 MB

            try {
                if(!/\.(mei|mid|midi|txt|text|musicxml|mxl|xml)$/i.test(file.originalname))
                    throw Error("Invalid file extension")
                if(file.size > maxFileSize)
                    throw Error("File size exceeded")
                fs.writeFileSync(filePath, file.buffer);
                savedFiles.push({
                    originalFilename: file.originalname,
                    newFilename: fileName,
                    filePath: filePath,
                    size: file.size,
                    uploadedAt: new Date(Date.now())
                });
            } catch {
                failed.push(fileName)
            }
        }

        artwork.files = savedFiles
        await artwork.save({session});
    }
    return {
        artwork: artwork,
        savedFilesCount: savedFiles.length,
        failedUploadsCount: failed.length,
        failedUploadsFilenames: failed
    }
}