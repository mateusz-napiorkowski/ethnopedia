export interface artworkCategory {
    name: string
    value: string
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

export interface fileToDelete {
    originalFilename: string,
    filePath: string,
    size: number,
    uploadedAt: Date,
    _id: string
}