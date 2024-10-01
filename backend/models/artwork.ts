import mongoose from "mongoose"

const artworkSchema = new mongoose.Schema({},{
    strict: false,
    timestamps: true,
})

const artworkCollection = mongoose.model("Artworks", artworkSchema);

export default artworkCollection;