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
router.route("/edit/:artworkId").put(editArtwork)
router.route("/delete").delete(deleteArtworks)

module.exports = router