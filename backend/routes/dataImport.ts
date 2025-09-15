import express from "express"

import {importData, importDataAsCollection} from "../controllers/data-import";
import upload from "../middleware/upload"

const router = express.Router()

router.route("/").post(importData)
router.route("/newCollection").post(upload.single("file"), importDataAsCollection)

export default router;
