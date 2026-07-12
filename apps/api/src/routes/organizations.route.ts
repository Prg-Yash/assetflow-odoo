import { Router } from "express";
import {
  getCurrentOrganization,
  updateOrganizationSettings,
  getUserOrganizations,
  createOrganization,
  switchActiveOrganization,
} from "../controllers/organizations.controller.js";
import { requireAuth, requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

// Multi-organization & switching routes (require standard login auth)
router.get("/my-memberships", requireAuth, getUserOrganizations);
router.post("/", requireAuth, createOrganization);
router.post("/switch", requireAuth, switchActiveOrganization);

// Active organization context routes
router.get("/current", requireOrganization, getCurrentOrganization);
router.patch("/settings", requireOrganization, requireRoleType("ADMIN"), updateOrganizationSettings);

export default router;
