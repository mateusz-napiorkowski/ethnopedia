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

const constructSubcategoriesFilter = (subcategories: Array<Array<string>>, depth: number) => {
    let subcategoryFilter: any = {$all: []}
    for(const [subcategoryName, subValue] of subcategories) {
        const deeperSubcategories = subcategories.filter(([deeperSubcategoryName]) => 
            deeperSubcategoryName.startsWith(`${subcategoryName}.`)
        );

        const isCurrentDepthSubcategory = subcategoryName.split('.').length === depth
        if(isCurrentDepthSubcategory && deeperSubcategories.length === 0 && subValue !== undefined) {
            subcategoryFilter.$all.push({
                $elemMatch: {
                    name: subcategoryName.split('.').slice(depth - 1).join('.'),
                    values: [subValue]
                }
            })
        } else if(isCurrentDepthSubcategory && subValue === undefined) {
            subcategoryFilter.$all.push({
                $elemMatch: {
                    name: subcategoryName.split('.').slice(depth - 1).join('.'),
                    subcategories: constructSubcategoriesFilter(deeperSubcategories, depth + 1)
                }
            })
        } else if(isCurrentDepthSubcategory) {
            subcategoryFilter.$all.push({
                $elemMatch: {
                    name: subcategoryName.split('.').slice(depth - 1).join('.'),
                    values: [subValue],
                    subcategories: constructSubcategoriesFilter(deeperSubcategories, depth + 1)
                }
            })
        }
    }
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
            categoryFilter.$elemMatch.subcategories = constructSubcategoriesFilter(currentCategorySubcategoriesSearchRules, 2);

        queryFilter.categories.$all.push(categoryFilter);
    })
    return queryFilter
}

export const sortRecordsByCategory = (records: any, order: string) => {
    const [categoryToSortBy, ascOrDesc] = order.split('-')

    const recordAndCategoryValuePairs = records
    .flatMap((record: any) => 
        record.categories
            .filter((category: any) => category.name === categoryToSortBy)
            .map((category: any) => [record, category.values.join(", ")])
    )
    .sort((a: any, b: any) => a[1].toUpperCase().localeCompare(b[1].toUpperCase()));
    const sortedRecords = recordAndCategoryValuePairs.map((pair: any) => pair[0]);

    if(ascOrDesc == "desc")
        return sortedRecords.reverse()
    return sortedRecords
}