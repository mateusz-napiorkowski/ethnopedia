import mongoose from "mongoose"

const MAX_ATTEMPTS = 10
const BASE_DELAY_MS = 1000

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

const connectDB = async (uri: string) => {
    if (!uri) {
        throw new Error("MONGO_URI is not defined");
    }

    let attempt = 0
    while (attempt < MAX_ATTEMPTS) {
        attempt++
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 8000,
            });
            console.log(`MongoDB connected successfully (attempt ${attempt})`)
            return
        } catch (error) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, (error as any)?.message || error)
            if (attempt >= MAX_ATTEMPTS) {
                console.error("Max MongoDB connection attempts reached. Exiting.")
                process.exit(1)
            }
            const delay = BASE_DELAY_MS * Math.min(8, Math.pow(2, attempt - 1)) // cap exponential growth
            console.log(`Retrying in ${delay}ms...`)
            await sleep(delay)
        }
    }
};

export default connectDB
