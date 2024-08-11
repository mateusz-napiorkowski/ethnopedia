import express from "express"

const router = express.Router()

const {
    getCollectionCategories,
    getArtworkCategories
} = require("../controllers/categories")

router.route("/:name").get(getArtworkCategories)
router.route("/all/:collectionName").get(getCollectionCategories)

module.exports = router
