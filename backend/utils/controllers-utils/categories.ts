export const getCollectionCategoriesArray = ((records: any) => {
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
}) 

export const getNestedCategories = ((prefix: string, subcategories: any) => {
    const nestedCategories: Array<string> = []
    if(subcategories !== undefined) {
        for(const subcategory of subcategories){
            nestedCategories.push(`${prefix}${subcategory.name}`)
            nestedCategories.push(...getNestedCategories(`${prefix}${subcategory.name}.`, subcategory.subcategories))
        }
    }
    return nestedCategories
})