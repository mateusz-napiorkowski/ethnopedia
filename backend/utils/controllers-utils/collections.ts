import { getAllCategories } from "./data-export";

export const constructQuickSearchFilter = async (searchText: any, collectionName: string) => {
    const allCategories = await getAllCategories(collectionName)
    const maxDepth = Math.max.apply(Math, allCategories.map((cat) => cat.split('.').length))

    const queryFilter = {
        collectionName: collectionName,
        categories: {
            $elemMatch: {
                "$or": [
                    {
                        values: [searchText]
                    },
                    {
                        subcategories: {
                            $elemMatch: {
                                "$or": [
                                    {
                                        values: [searchText]
                                    },
                                    {
                                        subcategories: {
                                            $elemMatch: {
                                                values: [searchText]
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        }
        
    }
    return queryFilter
}

const constructSubcategoriesFilter = (subcategories: string, depth: number) => {
    let subcategoryFilter: any = {$all: []}
    for(const [subcategoryName, subValue] of subcategories) {
        let deeperSubcategories: any = []
        for(const [deeperSubcategoryName, deeperSubValue] of subcategories) {
            if(deeperSubcategoryName.startsWith(`${subcategoryName}.`)) {
                deeperSubcategories.push([deeperSubcategoryName, deeperSubValue])
            }
        }
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


export const constructAdvSearchFilter = (reqQuery: any, collectionName: string) => {
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

    const queryFilter: any = {
        collectionName: collectionName
    }
    const categoriesFilter: any = {$all: []}
    for(const [categoryName, value] of rulesArray) {
        const isNotSubcategoryName = categoryName.split('.').length === 1
        if(isNotSubcategoryName) {
            let subcategories: any = []
            for(const [subcategoryName, subValue] of rulesArray) {
                if(subcategoryName.startsWith(`${categoryName}.`)) {
                    subcategories.push([subcategoryName, subValue])
                }
            }
            if(!value) {
                categoriesFilter.$all.push({
                    $elemMatch: {
                        name: categoryName,
                        subcategories: constructSubcategoriesFilter(subcategories, 2)
                    }
                })
            }
            else if(subcategories.length === 0) {
                categoriesFilter.$all.push({
                    $elemMatch: {
                        name: categoryName,
                        values: [value]
                    }
                })
            } else {
                categoriesFilter.$all.push({
                    $elemMatch: {
                        name: categoryName,
                        values: [value],
                        subcategories: constructSubcategoriesFilter(subcategories, 2)
                    }
                })
            }
        }
    }
    queryFilter.categories = categoriesFilter
    // console.log(util.inspect(queryFilter, {showHidden: false, depth: null, colors: true}))
    return queryFilter
}



export const findSearchText = (searchText: any, subcategories: any) => {
    if(subcategories !== undefined) {
        for(const category of subcategories){
            for(const value of category.values) {
                if(value.toString().includes(searchText)) {
                    return true
                }
            }
            if(findSearchText(searchText, category.subcategories)) {
                return true
            }
        }
    }
    return false
}

export const findMatch = (subcategories: any, nameArray: Array<string>, ruleValue: string) => {
    let matched: boolean = false
    const categoryDepth = nameArray.length
    if(categoryDepth > 1) {
        const categoryPrefix = nameArray[0]
        for(const subcategory of subcategories) {
            if(subcategory.name == categoryPrefix) {
                matched = findMatch(subcategory.subcategories, nameArray.slice(1), ruleValue)
                if(matched) return true
            }
        }
    } else if (categoryDepth == 1) {
        for(const subcategory of subcategories) {
            if(subcategory.name == nameArray[0]) {   
                for(const subcategoryValue of subcategory.values) {
                    if(subcategoryValue == ruleValue) {
                        return true
                    }
                }
            }
        }
    }
    return false
}

export const sortRecordsByTitle = (records: any, order: any) => {
    if(order == "title-asc" || order == "title-desc") {
        const tempArray: any = []
        records.forEach((record:any) => {
            for(const category of record.categories){
                if(category.name == "Tytuł") {
                    tempArray.push([record, category.values.join(", ")])
                }
            }
        })
        tempArray.sort((a: any,b: any) => a[1].toUpperCase().localeCompare(b[1].toUpperCase()));
        const sortedRecords: any = []
        tempArray.forEach((pair:any) => {
            sortedRecords.push(pair[0])
        })
        if(order == "title-asc") {
            return sortedRecords
        } else {
            return sortedRecords.reverse()
        }
    }
}