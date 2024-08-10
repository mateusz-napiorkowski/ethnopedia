import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    accountCreationDate: { type: Date, default: Date.now },
})

module.exports = mongoose.model("User", UserSchema)