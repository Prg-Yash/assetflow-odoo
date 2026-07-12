import { Router } from "express";
import { getAllocations, createAllocation, returnAllocation, requestReturn } from "../controllers/allocations.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getAllocations);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), createAllocation);
router.patch("/:id/request-return", requestReturn);
router.patch("/:id/return", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), returnAllocation);

export default router;
