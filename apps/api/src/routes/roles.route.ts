import { Router } from "express";
import { getRoles, createRole, updateRolePermissions } from "../controllers/roles.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getRoles);
router.post("/", requireRoleType("ADMIN"), createRole);
router.patch("/:id/permissions", requireRoleType("ADMIN"), updateRolePermissions);

export default router;
