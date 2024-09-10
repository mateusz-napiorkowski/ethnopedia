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
        let tempArray: any = []
        records.forEach((record:any) => {
            for(const category of record.categories){
                if(category.name == "Tytuł") {
                    tempArray.push([record, category.values.join(", ")])
                }
            }
        })
        tempArray.sort((a: any,b: any) => a[1].toUpperCase().localeCompare(b[1].toUpperCase()));
        let sortedRecords: any = []
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

module.exports = { findSearchText, findMatch, sortRecordsByTitle }