import express from "express"

const router = express.Router()

const {
    getAllCollections,
    getCollection,
    getArtworksInCollection,
    createCollection,
    batchDeleteCollections
} = require("../controllers/collections")

router.route("/").get(getAllCollections)
router.route("/:name").get(getCollection)
router.route("/:name/artworks").get(getArtworksInCollection)
router.route("/create").post(createCollection)
router.route("/:collection").delete(batchDeleteCollections)

module.exports = router
