import { Router } from "express";
import { handleAuthRoutes } from "../controllers/auth.controller.js";

const router = Router();

router.all("/*", handleAuthRoutes);

export default router;
