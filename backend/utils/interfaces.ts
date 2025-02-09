export interface artworkCategory {
    name: string
    values: Array<string>
    subcategories: Array<artworkCategory>
}

export interface record {
    categories: Array<artworkCategory>,
    collectionName: string
}

export interface collectionCategory {
    name: string,
    subcategories: Array<collectionCategory>
}