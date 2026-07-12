import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog, createNotification } from "../utils/activity.util.js";

export const getAllocations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const assetId = typeof req.query.assetId === "string" ? req.query.assetId : undefined;
    const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(assetId && { assetId }),
      ...(employeeId && { employeeId }),
      ...(status && { status }),
    };

    // Role-Based Scoping according to PDF Page 5:
    if (req.role?.roleType === "EMPLOYEE") {
      if (!req.employeeProfile) {
        throw new ApiError(403, "Employee profile not found for the active user in this organization.");
      }
      // Employee strictly views assets allocated to them
      where.employeeId = req.employeeProfile.id;
    } else if (req.role?.roleType === "DEPARTMENT_HEAD" && req.employeeProfile?.departmentId) {
      // Department Head views assets allocated within their department
      where.employee = { departmentId: req.employeeProfile.departmentId };
    }

    const allocations = await db.allocation.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true, condition: true } },
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true } },
          },
        },
        allocatedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { allocatedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: allocations,
    });
  } catch (error) {
    next(error);
  }
};

export const createAllocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { assetId, employeeId, expectedReturn, remarks } = req.body;

    if (!assetId || !employeeId) {
      throw new ApiError(400, "assetId and employeeId are required");
    }

    const asset = await db.asset.findFirst({
      where: { id: String(assetId), organizationId },
    });

    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    if (asset.status === "ALLOCATED" || asset.status === "UNDER_MAINTENANCE" || asset.status === "LOST" || asset.status === "DISPOSED") {
      const currentHolder = await db.allocation.findFirst({
        where: { assetId: String(assetId), status: "ACTIVE" },
        include: { employee: { include: { user: { select: { name: true } } } } },
      });

      const holderName = currentHolder?.employee?.user?.name || "another employee";
      throw new ApiError(
        409,
        `Asset is currently held by ${holderName} (status: ${asset.status}). Please initiate a Transfer Request instead.`
      );
    }

    const employee = await db.employee.findFirst({
      where: { id: String(employeeId), organizationId },
      include: { user: true },
    });

    if (!employee) {
      throw new ApiError(404, "Target employee not found");
    }

    if (req.role?.roleType === "DEPARTMENT_HEAD" && req.employeeProfile?.departmentId) {
      if (asset.departmentId && asset.departmentId !== req.employeeProfile.departmentId) {
        throw new ApiError(403, "Forbidden: Department Heads can only allocate assets assigned to their department.");
      }
      if (employee.departmentId !== req.employeeProfile.departmentId) {
        throw new ApiError(403, "Forbidden: Department Heads can only allocate assets to employees within their department.");
      }
    }

    const allocation = await db.$transaction(async (tx) => {
      const alloc = await tx.allocation.create({
        data: {
          organizationId,
          assetId: String(assetId),
          employeeId: String(employeeId),
          allocatedById: req.user?.id || null,
          expectedReturn: expectedReturn ? new Date(expectedReturn) : null,
          remarks: remarks ? String(remarks) : null,
          status: "ACTIVE",
        },
        include: { asset: true, employee: { include: { user: true } } },
      });

      await tx.asset.update({
        where: { id: String(assetId) },
        data: { status: "ALLOCATED" },
      });

      return alloc;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Allocation",
      entityId: allocation.id,
      action: "ALLOCATED",
      metadata: { assetCode: asset.assetCode, employeeId, employeeName: employee.user.name, expectedReturn },
    });

    await createNotification({
      organizationId,
      userId: employee.userId,
      title: "New Asset Assigned",
      body: `You have been assigned asset ${asset.name} (${asset.assetCode}). Expected return: ${
        expectedReturn ? new Date(expectedReturn).toLocaleDateString() : "Indefinite"
      }.`,
      type: "ASSET_ASSIGNED",
    });

    res.status(201).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    next(error);
  }
};

export const returnAllocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { returnCondition, returnNotes } = req.body;

    const existing = await db.allocation.findFirst({
      where: { id, organizationId, status: "ACTIVE" },
      include: { asset: true, employee: { include: { user: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Active allocation record not found");
    }

    const returned = await db.$transaction(async (tx) => {
      const updatedAlloc = await tx.allocation.update({
        where: { id: existing.id },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
          returnCondition: returnCondition || existing.asset.condition,
          returnNotes: returnNotes ? String(returnNotes) : null,
        },
      });

      await tx.asset.update({
        where: { id: existing.assetId },
        data: {
          status: "AVAILABLE",
          ...(returnCondition && { condition: returnCondition }),
        },
      });

      return updatedAlloc;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Allocation",
      entityId: id,
      action: "RETURNED",
      metadata: {
        assetCode: existing.asset.assetCode,
        returnCondition: returned.returnCondition,
        returnNotes: returned.returnNotes,
      },
    });

    res.status(200).json({
      success: true,
      data: returned,
    });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { reason } = req.body;

    const existing = await db.allocation.findFirst({
      where: { id, organizationId, status: "ACTIVE" },
      include: { asset: true, employee: { include: { user: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Active allocation record not found");
    }

    // If caller is Employee, verify they are the actual holder of this allocation
    if (req.role?.roleType === "EMPLOYEE" && existing.employeeId !== req.employeeProfile?.id) {
      throw new ApiError(403, "Forbidden: You can only initiate return requests for assets allocated to you.");
    }

    const updated = await db.allocation.update({
      where: { id: existing.id },
      data: {
        remarks: `[RETURN REQUESTED on ${new Date().toISOString().split("T")[0]}]: ${reason || "No reason provided"}`,
      },
      include: { asset: true, employee: { include: { user: true } } },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Allocation",
      entityId: id,
      action: "RETURN_REQUESTED",
      metadata: { assetCode: existing.asset.assetCode, reason },
    });

    // Notify Asset Manager / Department Head
    if (existing.allocatedById) {
      await createNotification({
        organizationId,
        userId: existing.allocatedById,
        title: "Asset Return Requested",
        body: `Employee ${existing.employee.user.name} requested to return ${existing.asset.name} (${existing.asset.assetCode}). Reason: ${reason || "N/A"}`,
        type: "TRANSFER_REQUEST",
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
