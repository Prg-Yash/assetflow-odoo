import { Router } from "express";
import { getInvites, createInvite, acceptInvite, resendInvite, deleteInvite } from "../controllers/invites.controller.js";
import { requireAuth, requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/accept", requireAuth, acceptInvite);
router.get("/", requireOrganization, requireRoleType("ADMIN"), getInvites);
router.post("/", requireOrganization, requireRoleType("ADMIN"), createInvite);
router.post("/:id/resend", requireOrganization, requireRoleType("ADMIN"), resendInvite);
router.delete("/:id", requireOrganization, requireRoleType("ADMIN"), deleteInvite);

export default router;
