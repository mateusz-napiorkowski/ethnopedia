import express from "express"

const router = express.Router()

const {
    getXlsxWithArtworksData,
    getXlsxWithCollectionData
} = require("../controllers/dataExport")

router.route("/:collectionName").get(getXlsxWithArtworksData)
router.route("/collection/:collectionName").get(getXlsxWithCollectionData)

module.exports = router