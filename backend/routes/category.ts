import express from "express"

import {getArtworkCategories, getCollectionCategories} from "../controllers/categories";

const router = express.Router()

router.route("/all/:collectionName").get(getCollectionCategories)
router.route("/:name").get(getArtworkCategories)

export default router;
