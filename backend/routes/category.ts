import express from "express"

import {getCollectionCategories} from "../controllers/categories";

const router = express.Router()

router.route("/all/:collectionName").get(getCollectionCategories)

export default router;
