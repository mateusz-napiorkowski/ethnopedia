import express from "express"

import {getXlsxWithArtworksData, getXlsxWithCollectionData} from "../controllers/data-export";

const router = express.Router()

router.route("/:collectionId").get(getXlsxWithArtworksData)
router.route("/collection/:collectionId").get(getXlsxWithCollectionData)

export default router;