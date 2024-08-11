import express from "express"

const router = express.Router()

const {
    getAllCollections,
    getCollection,
    createCollection,
    batchDeleteCollections,
    getArtworksInCollection,
} = require("../controllers/collections")

router.route("/:name/artworks").get(getArtworksInCollection)
router.route("/").get(getAllCollections)
router.route("/:name").get(getCollection)
router.route("/:collection").delete(batchDeleteCollections)
router.route("/add").post(createCollection)

module.exports = router
