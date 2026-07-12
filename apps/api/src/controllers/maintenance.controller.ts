import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog, createNotification } from "../utils/activity.util.js";

export const getMaintenanceRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const assetId = typeof req.query.assetId === "string" ? req.query.assetId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(assetId && { assetId }),
      ...(status && { status }),
      ...(priority && { priority }),
    };

    if (req.role?.roleType === "EMPLOYEE" && req.user?.id) {
      where.raisedById = req.user.id;
    } else if (req.role?.roleType === "DEPARTMENT_HEAD" && req.employeeProfile?.departmentId) {
      where.asset = { departmentId: req.employeeProfile.departmentId };
    }

    const requests = await db.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true } },
        raisedBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        attachments: true,
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const createMaintenanceRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { assetId, priority, issue, attachments } = req.body;

    if (!assetId || !issue) {
      throw new ApiError(400, "assetId and issue are required");
    }

    const asset = await db.asset.findFirst({
      where: { id: String(assetId), organizationId },
    });

    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const request = await db.maintenanceRequest.create({
      data: {
        organizationId,
        assetId: String(assetId),
        raisedById: req.user?.id || null,
        priority: priority || "MEDIUM",
        issue,
        status: "OPEN",
        ...(attachments && Array.isArray(attachments) && {
          attachments: {
            create: attachments.map((a: { url: string; filename?: string }) => ({
              url: a.url,
              filename: a.filename || "damage-photo.jpg",
            })),
          },
        }),
      },
      include: { asset: true, attachments: true, raisedBy: true },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "MaintenanceRequest",
      entityId: request.id,
      action: "RAISED",
      metadata: { assetCode: asset.assetCode, issue, priority },
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const approveMaintenance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.maintenanceRequest.findFirst({
      where: { id, organizationId, status: "OPEN" },
      include: { asset: true, raisedBy: true },
    });

    if (!existing) {
      throw new ApiError(404, "Open maintenance request not found");
    }

    const result = await db.$transaction(async (tx) => {
      const updatedReq = await tx.maintenanceRequest.update({
        where: { id: existing.id },
        data: {
          status: "APPROVED",
          approvedById: req.user?.id || null,
        },
      });

      await tx.asset.update({
        where: { id: existing.assetId },
        data: { status: "UNDER_MAINTENANCE" },
      });

      return updatedReq;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "MaintenanceRequest",
      entityId: id,
      action: "APPROVED",
      metadata: { assetCode: existing.asset.assetCode },
    });

    if (existing.raisedById) {
      await createNotification({
        organizationId,
        userId: existing.raisedById,
        title: "Maintenance Approved",
        body: `Repair request for ${existing.asset.name} has been approved and moved to Under Maintenance.`,
        type: "MAINTENANCE_APPROVED",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const assignTechnician = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { assignedToId } = req.body;

    if (!assignedToId) {
      throw new ApiError(400, "assignedToId is required");
    }

    const existing = await db.maintenanceRequest.findFirst({
      where: { id, organizationId },
      include: { asset: true },
    });

    if (!existing) {
      throw new ApiError(404, "Maintenance request not found");
    }

    const updated = await db.maintenanceRequest.update({
      where: { id: existing.id },
      data: {
        assignedToId: String(assignedToId),
        status: "IN_PROGRESS",
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "MaintenanceRequest",
      entityId: id,
      action: "ASSIGNED_TECHNICIAN",
      metadata: { assignedToId },
    });

    await createNotification({
      organizationId,
      userId: String(assignedToId),
      title: "Technician Assignment",
      body: `You have been assigned to repair asset ${existing.asset.name} (${existing.asset.assetCode}).`,
      type: "MAINTENANCE_ASSIGNED",
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveMaintenance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { resolution, cost } = req.body;

    const existing = await db.maintenanceRequest.findFirst({
      where: { id, organizationId },
      include: { asset: true, raisedBy: true },
    });

    if (!existing) {
      throw new ApiError(404, "Maintenance request not found");
    }

    const result = await db.$transaction(async (tx) => {
      const updatedReq = await tx.maintenanceRequest.update({
        where: { id: existing.id },
        data: {
          status: "RESOLVED",
          resolution: resolution || null,
          cost: cost !== undefined ? Number(cost) : existing.cost,
          closedAt: new Date(),
        },
      });

      await tx.asset.update({
        where: { id: existing.assetId },
        data: { status: "AVAILABLE" },
      });

      return updatedReq;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "MaintenanceRequest",
      entityId: id,
      action: "RESOLVED",
      metadata: { resolution, cost },
    });

    if (existing.raisedById) {
      await createNotification({
        organizationId,
        userId: existing.raisedById,
        title: "Maintenance Resolved",
        body: `Asset ${existing.asset.name} has been repaired and is now Available.`,
        type: "MAINTENANCE_RESOLVED",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectMaintenance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { resolution } = req.body;

    const existing = await db.maintenanceRequest.findFirst({
      where: { id, organizationId, status: "OPEN" },
      include: { asset: true, raisedBy: true },
    });

    if (!existing) {
      throw new ApiError(404, "Open maintenance request not found");
    }

    const rejected = await db.maintenanceRequest.update({
      where: { id: existing.id },
      data: {
        status: "REJECTED",
        resolution: resolution || "Rejected by Asset Manager",
        closedAt: new Date(),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "MaintenanceRequest",
      entityId: id,
      action: "REJECTED",
      metadata: { resolution },
    });

    if (existing.raisedById) {
      await createNotification({
        organizationId,
        userId: existing.raisedById,
        title: "Maintenance Rejected",
        body: `Your maintenance request for ${existing.asset.name} was rejected.`,
        type: "MAINTENANCE_REJECTED",
      });
    }

    res.status(200).json({
      success: true,
      data: rejected,
    });
  } catch (error) {
    next(error);
  }
};

export const addMaintenanceComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { comment } = req.body;

    if (!comment) {
      throw new ApiError(400, "Comment text is required");
    }

    const existing = await db.maintenanceRequest.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Maintenance request not found");
    }

    const created = await db.maintenanceComment.create({
      data: {
        maintenanceId: id,
        userId: req.user?.id || null,
        comment: String(comment),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};
