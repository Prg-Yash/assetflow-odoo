import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getRoles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const roles = await db.role.findMany({
      where: { organizationId },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { name, description, roleType, permissions } = req.body;

    if (!name) {
      throw new ApiError(400, "Role name is required");
    }

    const role = await db.role.create({
      data: {
        organizationId,
        name: String(name),
        description: description ? String(description) : null,
        roleType: roleType || "CUSTOM",
        ...(permissions && Array.isArray(permissions) && {
          permissions: {
            connectOrCreate: permissions.map((p: string) => ({
              where: { name: p },
              create: { name: p, description: `Permission ${p}` },
            })),
          },
        }),
      },
      include: { permissions: true },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Role",
      entityId: role.id,
      action: "CREATED",
      metadata: req.body,
    });

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRolePermissions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { permissions, description } = req.body;

    const existing = await db.role.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Role not found");
    }

    const updated = await db.role.update({
      where: { id: existing.id },
      data: {
        ...(description !== undefined && { description: description ? String(description) : null }),
        ...(permissions && Array.isArray(permissions) && {
          permissions: {
            set: [],
            connectOrCreate: permissions.map((p: string) => ({
              where: { name: p },
              create: { name: p, description: `Permission ${p}` },
            })),
          },
        }),
      },
      include: { permissions: true },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Role",
      entityId: id,
      action: "UPDATED_PERMISSIONS",
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
