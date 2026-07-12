import { Router } from "express";
import healthRouter from "./health.route.js";
import mediaRouter from "./media.route.js";
import protectedRouter from "./protected.route.js";
import organizationsRouter from "./organizations.route.js";
import departmentsRouter from "./departments.route.js";
import locationsRouter from "./locations.route.js";
import employeesRouter from "./employees.route.js";
import rolesRouter from "./roles.route.js";
import invitesRouter from "./invites.route.js";
import categoriesRouter from "./categories.route.js";
import vendorsRouter from "./vendors.route.js";
import purchasesRouter from "./purchases.route.js";
import assetsRouter from "./assets.route.js";
import allocationsRouter from "./allocations.route.js";
import transfersRouter from "./transfers.route.js";
import bookingsRouter from "./bookings.route.js";
import maintenanceRouter from "./maintenance.route.js";
import auditsRouter from "./audits.route.js";
import dashboardRouter from "./dashboard.route.js";
import notificationsRouter, { activityLogsRouter } from "./notifications.route.js";
import approvalsRouter from "./approvals.route.js";

const router = Router();

// Base System / Health
router.use("/health", healthRouter);

router.use("/media", mediaRouter);
router.use("/protected", protectedRouter);

// Organization & Tenant Setup
router.use("/organizations", organizationsRouter);
router.use("/departments", departmentsRouter);
router.use("/locations", locationsRouter);

// User & Directory Management
router.use("/employees", employeesRouter);
router.use("/roles", rolesRouter);
router.use("/invites", invitesRouter);

// Master Data & Procurement
router.use("/categories", categoriesRouter);
router.use("/vendors", vendorsRouter);
router.use("/purchases", purchasesRouter);

// Core Assets & QR Catalog
router.use("/assets", assetsRouter);

// Asset Operations & Lifecycles
router.use("/allocations", allocationsRouter);
router.use("/transfers", transfersRouter);
router.use("/bookings", bookingsRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/audits", auditsRouter);
router.use("/approval-requests", approvalsRouter);

// Dashboard, Reports & Audit Trails
router.use("/dashboard", dashboardRouter);
router.use("/notifications", notificationsRouter);
router.use("/activity-logs", activityLogsRouter);

export default router;
