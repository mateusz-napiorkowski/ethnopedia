import mongoose from "mongoose"

const CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    categories: {
        type: Array<any>
    }
})

const CollectionCollection = mongoose.model("Collection", CollectionSchema)

export default CollectionCollection
