import { Router } from "express";
import { getAudits, getAuditById, createAuditCycle, updateAuditItem, closeAuditCycle } from "../controllers/audits.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getAudits);
router.get("/:id", getAuditById);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createAuditCycle);
router.patch("/items/:itemId", updateAuditItem);
router.patch("/:id/close", requireRoleType("ADMIN", "ASSET_MANAGER"), closeAuditCycle);

export default router;
