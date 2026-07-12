import { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@repo/auth";

export const handleAuthRoutes = (req: Request, res: Response) => {
  if (req.url.includes("/forget-password") || req.originalUrl.includes("/forget-password")) {
    req.url = req.url.replace("/forget-password", "/request-password-reset");
    req.originalUrl = req.originalUrl.replace("/forget-password", "/request-password-reset");
  }
  return toNodeHandler(auth)(req, res);
};
