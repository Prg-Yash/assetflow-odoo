import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog, createNotification } from "../utils/activity.util.js";
import { queueService } from "../services/queue.service.js";

export const getAudits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
    const locationId = typeof req.query.locationId === "string" ? req.query.locationId : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(status && { status }),
      ...(departmentId && { departmentId }),
      ...(locationId && { locationId }),
    };

    const audits = await db.auditCycle.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        auditor: { select: { id: true, name: true, email: true } },
        _count: { select: { auditItems: true } },
      },
      orderBy: { startDate: "desc" },
    });

    res.status(200).json({
      success: true,
      data: audits,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const audit = await db.auditCycle.findFirst({
      where: { id, organizationId },
      include: {
        department: true,
        location: true,
        auditor: true,
        auditItems: {
          include: {
            asset: {
              select: { id: true, assetCode: true, name: true, serialNumber: true, status: true, condition: true },
            },
          },
        },
      },
    });

    if (!audit) {
      throw new ApiError(404, "Audit cycle not found");
    }

    res.status(200).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    next(error);
  }
};

export const createAuditCycle = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { title, departmentId, locationId, auditorId, startDate, endDate } = req.body;

    if (!title || !startDate || !endDate) {
      throw new ApiError(400, "title, startDate, and endDate are required");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assetWhere: any = {
      organizationId,
      ...(departmentId && { departmentId: String(departmentId) }),
      ...(locationId && { locationId: String(locationId) }),
      status: { not: "DISPOSED" },
    };

    const targetAssets = await db.asset.findMany({ where: assetWhere });

    const audit = await db.$transaction(async (tx) => {
      const created = await tx.auditCycle.create({
        data: {
          organizationId,
          title: String(title),
          departmentId: departmentId ? String(departmentId) : null,
          locationId: locationId ? String(locationId) : null,
          auditorId: auditorId ? String(auditorId) : req.user?.id || null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: "IN_PROGRESS",
          auditItems: {
            create: targetAssets.map((a) => ({
              assetId: a.id,
              result: "UNCHECKED",
            })),
          },
        },
        include: { auditItems: true, auditor: true },
      });

      return created;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "AuditCycle",
      entityId: audit.id,
      action: "CREATED",
      metadata: { title, itemCount: audit.auditItems.length, departmentId, locationId },
    });

    if (audit.auditorId) {
      await createNotification({
        organizationId,
        userId: audit.auditorId,
        title: "Assigned Audit Cycle",
        body: `You have been assigned to audit cycle "${audit.title}" covering ${audit.auditItems.length} assets.`,
        type: "AUDIT_ASSIGNED",
      });
    }

    res.status(201).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuditItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const itemId = String(req.params.itemId);
    const { result, remarks, condition } = req.body;

    if (!result) {
      throw new ApiError(400, "Audit result is required (VERIFIED, MISSING, DAMAGED, or UNCHECKED)");
    }

    const item = await db.auditItem.findUnique({
      where: { id: itemId },
      include: { audit: true, asset: true },
    });

    if (!item || item.audit.organizationId !== organizationId) {
      throw new ApiError(404, "Audit item not found in organization");
    }

    if (item.audit.status === "COMPLETED") {
      throw new ApiError(400, "Cannot modify items in a completed/closed audit cycle.");
    }

    const updated = await db.auditItem.update({
      where: { id: itemId },
      data: {
        result,
        remarks: remarks !== undefined ? String(remarks) : item.remarks,
        ...(condition && { condition }),
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const closeAuditCycle = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.auditCycle.findFirst({
      where: { id, organizationId },
      include: { auditItems: { include: { asset: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Audit cycle not found");
    }

    if (existing.status === "COMPLETED") {
      throw new ApiError(400, "Audit cycle is already closed");
    }

    const closed = await db.$transaction(async (tx) => {
      const updatedCycle = await tx.auditCycle.update({
        where: { id: existing.id },
        data: { status: "COMPLETED" },
      });

      for (const item of existing.auditItems) {
        if (item.result === "MISSING" && item.asset.status !== "LOST") {
          await tx.asset.update({
            where: { id: item.assetId },
            data: { status: "LOST" },
          });
        } else if (item.result === "DAMAGED" && item.asset.condition !== "DAMAGED") {
          await tx.asset.update({
            where: { id: item.assetId },
            data: { condition: "DAMAGED" },
          });
        }
      }

      return updatedCycle;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "AuditCycle",
      entityId: id,
      action: "CLOSED",
      metadata: { title: existing.title, totalItems: existing.auditItems.length },
    });

    // Enqueue background discrepancy report compilation (`audit-queue` -> apps/worker)
    queueService.enqueue({
      type: "AUDIT_DISCREPANCY_GENERATOR",
      data: {
        auditCycleId: id,
        organizationId,
        recipientEmail: req.user?.email || "admin@assetflow.com",
      },
    });

    res.status(200).json({
      success: true,
      data: closed,
    });
  } catch (error) {
    next(error);
  }
};
