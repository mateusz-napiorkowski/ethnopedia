import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    accountCreationDate: { type: Date, default: Date.now },
})

const UserCollection = mongoose.model("User", UserSchema)

export default UserCollection;