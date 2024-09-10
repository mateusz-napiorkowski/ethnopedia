export const getNestedCategories = ((prefix: string, subcategories: any) => {
    let nestedCategories: Array<string> = []
    if(subcategories !== undefined) {
        for(const subcategory of subcategories){
            nestedCategories.push(`${prefix}${subcategory.name}`)
            nestedCategories.push(...getNestedCategories(`${prefix}${subcategory.name}.`, subcategory.subcategories))
        }
    }
    return nestedCategories
})

module.exports = { getNestedCategories }