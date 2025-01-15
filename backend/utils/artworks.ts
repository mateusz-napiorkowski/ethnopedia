import { getAllCategories } from "./categories";

const fillSubcategoriesFilterPart: any = (searchText: string, currentDepth: number, maxDepth: number) => {
    if (maxDepth === 0) return []
    return {
        $elemMatch: {
            $or: currentDepth === maxDepth 
                ? [{ values: [searchText] }] 
                : [
                    { values: [searchText] },
                    { subcategories: fillSubcategoriesFilterPart(searchText, currentDepth + 1, maxDepth) }
                ]
        }
    }
}

export const constructQuickSearchFilter = async (searchText: any, collectionName: string) => {
    const allCategories = await getAllCategories(collectionName)
    const maxDepth = allCategories.length > 0 ?
        Math.max.apply(Math, allCategories.map((category) => category.split('.').length)) : 0
    const queryFilter = {
        collectionName: collectionName,
        categories: fillSubcategoriesFilterPart(searchText, 1, maxDepth)
    }
    return queryFilter
}

const constructAdvSearchSubcategoriesFilter = (searchRules: Array<Array<string>>, depth: number) => {
    let subcategoryFilter: any = {$all: []}
    searchRules.forEach(([subcategoryName, subcategoryValue]) => {
        const subcategoryNameSplitByDot = subcategoryName.split('.');
        const isCurrentDepthSubcategory = subcategoryNameSplitByDot.length === depth;
        if (!isCurrentDepthSubcategory) return

        const deeperSubcategoriesSearchRules = searchRules.filter(([deeperSubcategoryName]) => 
            deeperSubcategoryName.startsWith(`${subcategoryName}.`)
        );

        let newFilterPart: any = {
            $elemMatch: {
                name: subcategoryNameSplitByDot.slice(depth - 1).join('.'),
            }
        };

        if(subcategoryValue)
            newFilterPart.$elemMatch.values = [subcategoryValue]

        if(deeperSubcategoriesSearchRules.length != 0)
            newFilterPart.$elemMatch.subcategories = constructAdvSearchSubcategoriesFilter(deeperSubcategoriesSearchRules, depth + 1)

        subcategoryFilter.$all.push(newFilterPart)
    })
    return subcategoryFilter
}

const getOnlySearchRulesArray = (reqQuery: any) => {
    let rulesArray: any = []
    for(const categoryName in reqQuery) {
        if(!["page", "pageSize", "sortOrder", "search"].includes(categoryName)) {
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

export const constructAdvSearchFilter = (requestQuery: any, collectionName: string) => {
    const searchRules = getOnlySearchRulesArray(requestQuery)

    const queryFilter: any = {
        collectionName: collectionName,
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

        if(categoryValue)
            categoryFilter.$elemMatch.values = [categoryValue];
        
        if(currentCategorySubcategoriesSearchRules.length > 0)
            categoryFilter.$elemMatch.subcategories = constructAdvSearchSubcategoriesFilter(currentCategorySubcategoriesSearchRules, 2);

        queryFilter.categories.$all.push(categoryFilter);
    })
    return queryFilter
}

const findMatchingCategory = (categoryName: string, record: any) => {
    if(categoryName.split(".").length === 1) {
        if(!record.subcategories)
            return record.categories.find((category: any) => category.name === categoryName);
        return record.subcategories.find((category: any) => category.name === categoryName);
    } else {
        const prefix = categoryName.split(".")[0]
        const rest = categoryName.split(".").slice(1).join(".")
        if(!record.subcategories) {
            const parent = record.categories.find((category: any) => category.name === prefix);
            if(!parent)
                return undefined
            return findMatchingCategory(rest, parent)
        }
        const parent = record.subcategories.find((category: any) => category.name === prefix);
        if(!parent)
            return undefined
        return findMatchingCategory(rest, parent)
    }
}

export const sortRecordsByCategory = (records: any, order: string) => {
    const [categoryToSortBy, ascOrDesc] = order.split('-')

    const recordAndCategoryValuePairs = records.map((record: any) => {
        const matchingCategory = findMatchingCategory(categoryToSortBy, record)
        const categoryValue = matchingCategory ? matchingCategory.values.join(", ") : null;
        return [record, categoryValue];
    })
    .sort((a: any, b: any) => {
        if (a[1] && b[1])
            return a[1].toUpperCase().localeCompare(b[1].toUpperCase())
        
        //records which have the category to sort by come first
        if (a[1]) return -1;
        if (b[1]) return 1;
    });    
    
    const sortedRecords = recordAndCategoryValuePairs.map((pair: any) => pair[0]);
    if(ascOrDesc == "desc")
        return sortedRecords.reverse()
    return sortedRecords
}