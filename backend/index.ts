import express from "express"

require("dotenv").config()

const app = express()
const cors = require("cors")


const auth = require("./routes/auth")
const artworks = require("./routes/artwork")
const collections = require("./routes/collection")
const categories = require("./routes/category")
const xlsx = require("./routes/xlsx")
const dataImport = require("./routes/dataImport")

import connectDB from "./db/connect"

app.use(cors())
app.use(express.json())

app.use("/api/v1/auth", auth)
app.use("/api/v1/artworks", artworks)
app.use("/api/v1/collection", collections)
app.use("/api/v1/categories", categories)
app.use("/api/v1/xlsx", xlsx)
app.use("/api/v1/dataImport", dataImport)

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)

        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`),
        )
    } catch (error) {
        console.log(error)
    }
}

start()