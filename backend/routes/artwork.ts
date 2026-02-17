import express from "express"

import {createArtwork, deleteArtworks, editArtwork, getArtwork, getArtworksForPage, getArtworksBySearchTextMatchedInTopmostCategory, addCollectionIdtoArtworks, getArtworkOmram} from "../controllers/artworks";
import upload from "../middleware/upload"

const router = express.Router()

router.route("/:artworkId").get(getArtwork)
router.route("/").get(getArtworksForPage)
router.route("/create").post(upload.array("files"), createArtwork)
router.route("/edit/:artworkId").put(upload.array("files"), editArtwork)
router.route("/delete").delete(deleteArtworks)
router.route("/addCollectionIdtoArtworks").put(addCollectionIdtoArtworks)

// OMRAM routes
router.route("/omram/search").get(getArtworksBySearchTextMatchedInTopmostCategory)
router.route("/omram/:artworkId").get(getArtworkOmram);

export default router;