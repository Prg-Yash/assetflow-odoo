import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@repo/auth";
import healthRouter from "./health.route.js";
import protectedRouter from "./protected.route.js";

const router = Router();

// Better Auth API route handler
router.all("/auth/*", (req, res) => {
  if (req.url.includes("/forget-password") || req.originalUrl.includes("/forget-password")) {
    req.url = req.url.replace("/forget-password", "/request-password-reset");
    req.originalUrl = req.originalUrl.replace("/forget-password", "/request-password-reset");
  }
  return toNodeHandler(auth)(req, res);
});

// Register sub-routers
router.use("/health", healthRouter);
router.use("/protected", protectedRouter);

export default router;
