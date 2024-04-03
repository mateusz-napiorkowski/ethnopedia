import express from "express"

const router = express.Router()

const {
    getXlsxWithArtworksData,
    getXlsxWithCollectionData,
    getAllCaterories
} = require("../controllers/xlsx")

router.route("/:collectionName").get(getXlsxWithArtworksData)
router.route("/collection/:collectionName").get(getXlsxWithCollectionData)
router.route("/keys/:collectionName").get(getAllCaterories)

module.exports = router