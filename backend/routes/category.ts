import express from "express"

const router = express.Router()

const {
    getCollectionCategories,
    getArtworkCategories
} = require("../controllers/categories")

router.route("/all/:collectionName").get(getCollectionCategories)
router.route("/:name").get(getArtworkCategories)

module.exports = router
