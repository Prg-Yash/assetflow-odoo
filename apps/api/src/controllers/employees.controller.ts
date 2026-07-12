import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getEmployees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(departmentId && { departmentId }),
    };

    const employees = await db.employee.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, status: true, image: true, role: true },
        },
        department: { select: { id: true, name: true } },
      },
      orderBy: { employeeCode: "asc" },
    });

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const employee = await db.employee.findFirst({
      where: { id, organizationId },
      include: {
        user: { select: { id: true, name: true, email: true, status: true, image: true, role: true } },
        department: true,
        allocations: {
          where: { status: "ACTIVE" },
          include: { asset: true },
        },
      },
    });

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { departmentId, designation, phone, joiningDate } = req.body;

    const existing = await db.employee.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Employee profile not found");
    }

    const updated = await db.employee.update({
      where: { id: existing.id },
      data: {
        ...(departmentId !== undefined && { departmentId: departmentId ? String(departmentId) : null }),
        ...(designation !== undefined && { designation: designation ? String(designation) : null }),
        ...(phone !== undefined && { phone: phone ? String(phone) : null }),
        ...(joiningDate !== undefined && { joiningDate: joiningDate ? new Date(joiningDate) : null }),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Employee",
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

export const promoteEmployee = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { designation, roleId, roleType } = req.body;

    if (!designation) {
      throw new ApiError(400, "New designation is required for promotion");
    }

    const existing = await db.employee.findFirst({
      where: { id, organizationId },
      include: { user: true },
    });

    if (!existing) {
      throw new ApiError(404, "Employee not found");
    }

    const updated = await db.$transaction(async (tx) => {
      const emp = await tx.employee.update({
        where: { id: existing.id },
        data: { designation: String(designation) },
      });

      let targetRoleId = roleId ? String(roleId) : null;

      if (!targetRoleId && roleType) {
        // Automatically find or resolve roleId for DEPARTMENT_HEAD / ASSET_MANAGER / ADMIN
        const roleRecord = await tx.role.findFirst({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          where: { organizationId, roleType: String(roleType) as any },
        });
        if (roleRecord) {
          targetRoleId = roleRecord.id;
        }
      }

      if (targetRoleId) {
        await tx.user.update({
          where: { id: existing.userId },
          data: { roleId: targetRoleId },
        });

        await tx.organizationMember.updateMany({
          where: { userId: existing.userId, organizationId },
          data: { roleId: targetRoleId },
        });
      }

      return emp;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Employee",
      entityId: id,
      action: "PROMOTED",
      metadata: { oldDesignation: existing.designation, newDesignation: designation, roleId },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
