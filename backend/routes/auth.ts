import express from "express";
import {deleteUser, loginUser, registerUser} from "../controllers/auth";

const router = express.Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/:userId").delete(deleteUser)

export default router;