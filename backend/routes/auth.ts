import express from "express";
import {deleteUser, getUserById, loginUser, registerUser} from "../controllers/auth";

const router = express.Router()

router.route("/:userId").get(getUserById)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/:userId").delete(deleteUser)

export default router;