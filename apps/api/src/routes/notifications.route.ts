import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getActivityLogs,
} from "../controllers/notifications.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

export const activityLogsRouter = Router();
activityLogsRouter.use(requireOrganization);
activityLogsRouter.get("/", requireRoleType("ADMIN", "ASSET_MANAGER"), getActivityLogs);

export default router;
