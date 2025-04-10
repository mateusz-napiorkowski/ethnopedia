import mongoose, { Schema, SchemaType } from "mongoose"

const artworkSchema = new mongoose.Schema({
    collectionName: {type: String},
    categories: {type: Schema.Types.Mixed}
},{
    strict: false,
    timestamps: true,
})

const artworkCollection = mongoose.model("Artworks", artworkSchema);

export default artworkCollection;