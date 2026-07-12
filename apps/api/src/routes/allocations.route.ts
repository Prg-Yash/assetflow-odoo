import { Router } from "express";
import { getAllocations, createAllocation, returnAllocation } from "../controllers/allocations.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getAllocations);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createAllocation);
router.patch("/:id/return", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), returnAllocation);

export default router;
