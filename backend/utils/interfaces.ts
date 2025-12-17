import mongoose from "mongoose"

export interface artworkCategory {
    name: string
    value: string
    subcategories: Array<artworkCategory>
}

export interface record {
    _id?: mongoose.Types.ObjectId,
    categories: Array<artworkCategory>,
    collectionName: string,
    collectionId: string,
    files?: Array<any>
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