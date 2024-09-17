import express from "express"

const router = express.Router()

const {
    getAllCollections,
    getCollection,
    getArtworksInCollection,
    createCollection,
    deleteCollections
} = require("../controllers/collections")

router.route("/").get(getAllCollections)
router.route("/:name").get(getCollection)
router.route("/:name/artworks").get(getArtworksInCollection)
router.route("/create").post(createCollection)
router.route("/delete").delete(deleteCollections)

module.exports = router
