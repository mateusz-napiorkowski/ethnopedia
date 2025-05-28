import express from "express"

import {getXlsxWithCollectionData, getXlsxWithArtworksData} from "../controllers/data-export";

const router = express.Router()

router.route("/collection/:collectionId").get(getXlsxWithCollectionData)
router.route("/").get(getXlsxWithArtworksData)

export default router;