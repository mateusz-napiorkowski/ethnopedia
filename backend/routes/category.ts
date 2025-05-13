import express from "express"

import {getCategories} from "../controllers/categories";

const router = express.Router()

router.route("/all").get(getCategories)

export default router;
