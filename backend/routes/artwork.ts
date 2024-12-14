import express from "express"

import {createArtwork, deleteArtworks, editArtwork, getArtwork, getArtworksForCollectionPage} from "../controllers/artworks";

const router = express.Router()

router.route("/:artworkId").get(getArtwork)
router.route("/:collectionName/artworks/:sortOrder").get(getArtworksForCollectionPage)
router.route("/create").post(createArtwork)
router.route("/edit/:artworkId").put(editArtwork)
router.route("/delete").delete(deleteArtworks)

export default router;