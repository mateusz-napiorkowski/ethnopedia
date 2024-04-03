import express from "express"

const router = express.Router()

const {
    importData
} = require("../controllers/importData")

router.route("/").post(importData)

module.exports = router
