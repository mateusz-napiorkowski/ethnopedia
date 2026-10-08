import mongoose from "mongoose"

const pbiSyncSchema = new mongoose.Schema({
    ethnopediaArtworkId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    ethnopediaCollectionId: {
        type: String,
        required: true,
        index: true,
    },
    pbiRoIdentifier: {
        type: String,
        required: false,
        index: true,
    },
    pbiAnnotationIdentifier: {
        type: String,
        required: false,
    },
    pbiResourceIdentifiers: {
        type: [String],
        default: [],
    },
    payloadHash: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["pending", "synced", "failed", "skipped"],
        default: "pending",
    },
    lastError: {
        type: String,
        required: false,
    },
    lastSyncedAt: {
        type: Date,
        required: false,
    },
}, {
    timestamps: true,
})

const PbiSync = mongoose.model("PbiSync", pbiSyncSchema)

export default PbiSync
