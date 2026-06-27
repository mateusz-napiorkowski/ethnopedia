import express from "express"
import { getPbiCollectionPreview, getPbiStatus, getPbiSyncs, previewPbiSync, syncCollectionToPbi } from "../controllers/pbi"

const router = express.Router()

router.route("/status").get(getPbiStatus)
router.route("/collections/:collectionId/preview").get(getPbiCollectionPreview)
router.route("/collections/:collectionId/sync/preview").post(previewPbiSync)
router.route("/collections/:collectionId/sync").post(syncCollectionToPbi)
router.route("/syncs").get(getPbiSyncs)

export default router
