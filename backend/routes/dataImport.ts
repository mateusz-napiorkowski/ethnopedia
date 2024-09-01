import express from "express"

const router = express.Router()

const {
    importData
} = require("../controllers/data-import")

router.route("/").post(importData)

module.exports = router
