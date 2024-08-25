import mongoose from "mongoose"

const artworkSchema = new mongoose.Schema({
    
},{
    strict: false,
    timestamps: true,
})

module.exports = mongoose.model("Artworks", artworkSchema)