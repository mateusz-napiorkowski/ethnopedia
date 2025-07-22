import express from "express"

import {getXlsxWithCollectionData, getXlsxWithArtworksData, getArtworksFilesArchive} from "../controllers/data-export";

const router = express.Router()

router.route("/collection/:collectionId").get(getXlsxWithCollectionData)
router.route("/").get(getXlsxWithArtworksData)
router.route("/files").get(getArtworksFilesArchive)

export default router;