import { Router } from "express";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  approveMaintenance,
  rejectMaintenance,
  assignTechnician,
  resolveMaintenance,
  addMaintenanceComment,
} from "../controllers/maintenance.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getMaintenanceRequests);
router.post("/", createMaintenanceRequest);
router.patch("/:id/approve", requireRoleType("ADMIN", "ASSET_MANAGER"), approveMaintenance);
router.patch("/:id/reject", requireRoleType("ADMIN", "ASSET_MANAGER"), rejectMaintenance);
router.patch("/:id/assign", requireRoleType("ADMIN", "ASSET_MANAGER"), assignTechnician);
router.patch("/:id/resolve", requireRoleType("ADMIN", "ASSET_MANAGER", "TECHNICIAN"), resolveMaintenance);
router.post("/:id/comments", addMaintenanceComment);

export default router;
