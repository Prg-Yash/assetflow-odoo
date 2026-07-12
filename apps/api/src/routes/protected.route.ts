import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: "You have successfully accessed a protected route!",
      user: req.user,
      session: req.session,
    },
  });
});

export default router;
