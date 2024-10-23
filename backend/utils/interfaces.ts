export interface subcategoryData {
    name: string
    values: Array<string>
    subcategories: Array<subcategoryData>
}

export interface record {
    categories: Array<subcategoryData>,
    collectionName: string
}