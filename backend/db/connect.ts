import mongoose from "mongoose"

const connectDB = async (uri: string) => {
    if (!uri) {
        throw new Error("MONGO_URI is not defined");
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB
