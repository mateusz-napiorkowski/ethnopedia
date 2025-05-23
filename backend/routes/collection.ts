import express from "express"

import {
    createCollection,
    deleteCollections,
    getAllCollections,
    getCollection,
    updateCollection,
} from "../controllers/collections";

const router = express.Router()

router.route("/").get(getAllCollections)
router.route("/:collectionId").get(getCollection)
router.route("/create").post(createCollection)
router.route("/delete").delete(deleteCollections)
router.route("/edit/:id").put(updateCollection)

export default router;
