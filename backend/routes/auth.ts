import express from "express";
import {deleteUser, getUserById, loginUser, registerUser, editUser} from "../controllers/auth";

const router = express.Router()

router.route("/:userId").get(getUserById)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/user-edit").post(editUser)
router.route("/:userId").delete(deleteUser)

export default router;