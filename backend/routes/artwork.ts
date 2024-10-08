import express from "express"

const router = express.Router()

const {
    getArtwork,
    createArtwork,
    editArtwork,
    deleteArtworks
} = require("../controllers/artworks")

router.route("/:artworkId").get(getArtwork)
router.route("/create").post(createArtwork)
router.route("/edit/:artworkId").post(editArtwork)
router.route("/:artwork").delete(deleteArtworks)

module.exports = router