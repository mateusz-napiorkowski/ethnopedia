import express from "express"

const router = express.Router()

const {
    getAllCollections,
    getCollection,
    createCollection,
    batchDeleteCollections,
    artworksInCollection,
    patchCollection,
    addNewCollection
} = require("../controllers/collections")

router.route("/:name/artworks").get(artworksInCollection)
router.route("/").get(getAllCollections)
router.route("/").post(createCollection)
router.route("/:name").get(getCollection)
router.route("/:collection").delete(batchDeleteCollections)
router.route("/:id").patch(patchCollection)
router.route("/add").post(addNewCollection)

module.exports = router
