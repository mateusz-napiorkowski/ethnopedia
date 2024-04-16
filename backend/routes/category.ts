import express from "express"

const router = express.Router()

const {
    getCategoriesById,
    getAllKeys
} = require("../controllers/categories")

router.route("/:name").get(getCategoriesById)
router.route("/all/:collectionName").get(getAllKeys)

module.exports = router
