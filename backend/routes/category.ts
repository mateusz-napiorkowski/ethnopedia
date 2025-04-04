import express from "express"

import {getCollectionCategories} from "../controllers/categories";

const router = express.Router()

router.route("/all/:collectionId").get(getCollectionCategories)

export default router;
