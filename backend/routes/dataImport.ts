import express from "express"

import {importData, importDataAsCollection} from "../controllers/data-import";

const router = express.Router()

router.route("/").post(importData)
router.route("/:collection").post(importDataAsCollection)

export default router;
