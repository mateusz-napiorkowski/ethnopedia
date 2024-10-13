import mongoose from "mongoose"

const CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
})

const CollectionCollection = mongoose.model("Collection", CollectionSchema)

export default CollectionCollection
