import express from "express"

const router = express.Router()

const {
    getXlsxWithAllData
} = require("../controllers/xlsx")

router.route("/").get(getXlsxWithAllData)

module.exports = router