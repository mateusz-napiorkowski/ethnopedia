import mongoose, { Schema, SchemaType } from "mongoose"

const artworkSchema = new mongoose.Schema({
    collectionName: {type: String},
    categories: {type: Schema.Types.Mixed},
    files: [
    {
        originalFilename: { type: String, required: false },
        newFilename: { type: String, required: false },
        filePath: { type: String, required: false },
        size: { type: Number, required: false},
        uploadedAt: { type: Date, default: Date.now }
    }
]
},{
    strict: false,
    timestamps: true,
})

const artworkCollection = mongoose.model("Artworks", artworkSchema);

export default artworkCollection;