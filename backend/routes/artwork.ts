import express from "express"

const router = express.Router()

const {
    getAllArtworks,
    getArtwork,
    createArtwork,
    editArtwork, 
    searchArtworks,
    batchDeleteArtworks,
    filterArtworks,
    patchArtwork
} = require("../controllers/artworks")

router.get("/search", searchArtworks)
router.route("/filter").get(filterArtworks)
router.route("/").get(getAllArtworks)
router.route("/:artworkId").put(patchArtwork)
router.route("/:artworkId").get(getArtwork)
router.route("/:artwork").delete(batchDeleteArtworks)
router.route("/create").post(createArtwork)
router.route("/edit/:artworkId").post(editArtwork)
module.exports = router