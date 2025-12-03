import express from "express"
import path from "path"
require("dotenv").config()

const app = express()
import connectDB from "./db/connect"

import cors from "cors";
import auth from "./routes/auth";
import dataImport from "./routes/dataImport";
import artworks from "./routes/artwork";
import collections from "./routes/collection";
import categories from "./routes/category";
import dataExport from "./routes/dataExport";
import health from "./routes/health";

app.use(cors())
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use('/api/v1/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next()
})

app.use("/api/v1/health_check", health)
app.use("/api/v1/auth", auth)
app.use("/api/v1/artworks", artworks)
app.use("/api/v1/collection", collections)
app.use("/api/v1/categories", categories)
app.use("/api/v1/dataExport", dataExport)
app.use("/api/v1/dataImport", dataImport)

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI!)

        app.listen(port, () =>
            {console.log(`Server is listening on port ${port}...`);console.log(process.env)}
        )
    } catch (error) {
        console.log(error)
    }
}

start()