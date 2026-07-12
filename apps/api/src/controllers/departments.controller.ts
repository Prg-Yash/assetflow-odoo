import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getDepartments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const departments = await db.department.findMany({
      where: { organizationId },
      include: {
        manager: {
          select: {
            id: true,
            employeeCode: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: { employees: true, assets: true },
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { name, managerId, parentDepartmentId } = req.body;

    if (!name) {
      throw new ApiError(400, "Department name is required");
    }

    const department = await db.department.create({
      data: {
        organizationId,
        name: String(name),
        managerId: managerId ? String(managerId) : null,
        parentDepartmentId: parentDepartmentId ? String(parentDepartmentId) : null,
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Department",
      entityId: department.id,
      action: "CREATED",
      metadata: { name, managerId },
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { name, managerId, parentDepartmentId, isActive } = req.body;

    const existing = await db.department.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Department not found");
    }

    const updated = await db.department.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(managerId !== undefined && { managerId: managerId ? String(managerId) : null }),
        ...(parentDepartmentId !== undefined && {
          parentDepartmentId: parentDepartmentId ? String(parentDepartmentId) : null,
        }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Department",
      entityId: id,
      action: "UPDATED",
      metadata: req.body,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.department.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { employees: true, assets: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Department not found");
    }

    if (existing._count.employees > 0 || existing._count.assets > 0) {
      throw new ApiError(400, "Cannot delete department containing employees or assets.");
    }

    await db.department.delete({
      where: { id: existing.id },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Department",
      entityId: id,
      action: "DELETED",
      metadata: { name: existing.name },
    });

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
