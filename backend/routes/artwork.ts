import express from "express"

import {createArtwork, deleteArtworks, editArtwork, getArtwork, getArtworksForPage, getArtworksBySearchTextMatchedInTopmostCategory} from "../controllers/artworks";

const router = express.Router()

router.route("/:artworkId").get(getArtwork)
router.route("/").get(getArtworksForPage)
router.route("/omram/search").get(getArtworksBySearchTextMatchedInTopmostCategory)
router.route("/create").post(createArtwork)
router.route("/edit/:artworkId").put(editArtwork)
router.route("/delete").delete(deleteArtworks)

export default router;