import express from "express"

require("dotenv").config()

const app = express()
const cors = require("cors")


const auth = require("./routes/auth")
const artworks = require("./routes/artwork")
const collections = require("./routes/collection")
const sections = require("./routes/section")
const subsections = require("./routes/subsection")
const categories = require("./routes/category")
const general = require("./routes/general")
const xlsx = require("./routes/xlsx")
const importFromFile = require("./routes/import")

import connectDB from "./db/connect"

app.use(cors())
app.use(express.json())

app.use("/api/v1/auth", auth)
app.use("/api/v1/artworks", artworks)
app.use("/api/v1/collection", collections)
app.use("/api/v1/sections", sections)
app.use("/api/v1/subsections", subsections)
app.use("/api/v1/categories", categories)
app.use("/api/v1", general)
app.use("/api/v1/xlsx", xlsx)
app.use("/api/v1/import", importFromFile)

const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        // await initializeDatabase()

        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`),
        )
    } catch (error) {
        console.log(error)
    }
}

start()