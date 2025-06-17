import mongoose, { Schema, SchemaType } from "mongoose"

const artworkSchema = new mongoose.Schema({
    collectionName: {type: String},
    categories: {type: Schema.Types.Mixed},
    filePath: {type: String, required: false},
    fileName: {type: String, required: false}
},{
    strict: false,
    timestamps: true,
})

const artworkCollection = mongoose.model("Artworks", artworkSchema);

export default artworkCollection;