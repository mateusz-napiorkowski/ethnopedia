import express from "express";
import { healthCheck } from "../controllers/health";

const router = express.Router();

router.get("/", healthCheck);

export default router;