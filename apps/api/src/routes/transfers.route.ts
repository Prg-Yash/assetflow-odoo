import { Router } from "express";
import { getTransfers, createTransferRequest, approveTransfer, rejectTransfer } from "../controllers/transfers.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getTransfers);
router.post("/", createTransferRequest);
router.patch("/:id/approve", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), approveTransfer);
router.patch("/:id/reject", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), rejectTransfer);

export default router;
