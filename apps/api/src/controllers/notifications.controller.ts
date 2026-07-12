import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const userId = req.user!.id;

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { organizationId, userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.count({
        where: { organizationId, userId, read: false },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const userId = req.user!.id;
    const id = String(req.params.id);

    const updated = await db.notification.updateMany({
      where: { id, organizationId, userId },
      data: { read: true },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const userId = req.user!.id;

    const updated = await db.notification.updateMany({
      where: { organizationId, userId, read: false },
      data: { read: true },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const entity = typeof req.query.entity === "string" ? req.query.entity : undefined;
    const entityId = typeof req.query.entityId === "string" ? req.query.entityId : undefined;
    const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
    const limit = typeof req.query.limit === "string" ? req.query.limit : "50";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(entity && { entity }),
      ...(entityId && { entityId }),
      ...(userId && { userId }),
    };

    const logs = await db.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(200, parseInt(limit) || 50),
    });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
