import express from "express"

import {
    createCollection,
    deleteCollections,
    getAllCollections,
    getArtworksInCollection,
    getCollection
} from "../controllers/collections";

const router = express.Router()

router.route("/").get(getAllCollections)
router.route("/:name").get(getCollection)
router.route("/:collectionName/artworks/:sortOrder").get(getArtworksInCollection)
router.route("/create").post(createCollection)
router.route("/delete").delete(deleteCollections)

export default router;
