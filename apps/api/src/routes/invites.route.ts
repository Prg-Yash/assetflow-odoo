import { Router } from "express";
import { getInvites, createInvite, acceptInvite } from "../controllers/invites.controller.js";
import { requireAuth, requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/accept", requireAuth, acceptInvite);
router.get("/", requireOrganization, requireRoleType("ADMIN"), getInvites);
router.post("/", requireOrganization, requireRoleType("ADMIN"), createInvite);

export default router;
