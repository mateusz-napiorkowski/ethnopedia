import express from "express"

import {getXlsxWithArtworksData, getXlsxWithCollectionData} from "../controllers/data-export";

const router = express.Router()

router.route("/:collectionName").get(getXlsxWithArtworksData)
router.route("/collection/:collectionName").get(getXlsxWithCollectionData)

export default router;