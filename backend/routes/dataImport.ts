import express from "express"

import {importData} from "../controllers/data-import";

const router = express.Router()

router.route("/").post(importData)

export default router;
