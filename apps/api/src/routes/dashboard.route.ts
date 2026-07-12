import { Router } from "express";
import {
  getDashboardKPIs,
  getOverdueAllocations,
  getUtilizationReport,
  getDepartmentAllocationsReport,
  getMaintenanceFrequencyReport,
} from "../controllers/dashboard.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/kpis", getDashboardKPIs);
router.get("/overdue", getOverdueAllocations);
router.get("/reports/utilization", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getUtilizationReport);
router.get("/reports/departments", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getDepartmentAllocationsReport);
router.get("/reports/maintenance", requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"), getMaintenanceFrequencyReport);

export default router;
