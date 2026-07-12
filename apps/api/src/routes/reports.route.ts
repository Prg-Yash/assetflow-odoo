import { Router } from "express";
import {
  exportReports,
  getReportsAssets,
  getReportsBookings,
  getReportsDashboard,
  getReportsMaintenance,
  getReportsUtilization,
} from "../controllers/reports.controller.js";
import { requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireRoleType("ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "AUDITOR"));

router.get("/dashboard", getReportsDashboard);
router.get("/utilization", getReportsUtilization);
router.get("/maintenance", getReportsMaintenance);
router.get("/assets", getReportsAssets);
router.get("/bookings", getReportsBookings);
router.get("/export", exportReports);

export default router;
