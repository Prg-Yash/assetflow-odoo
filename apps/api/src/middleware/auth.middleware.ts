import { Request, Response, NextFunction } from "express";
import { auth } from "@repo/auth";
import { fromNodeHeaders } from "better-auth/node";
import { ApiError } from "./error.middleware.js";

export interface AuthRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new ApiError(401, "Unauthorized: No active session found");
    }

    req.session = session.session;
    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}
