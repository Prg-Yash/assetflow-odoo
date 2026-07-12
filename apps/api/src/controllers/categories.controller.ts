import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const categories = await db.assetCategory.findMany({
      where: { organizationId },
      include: {
        _count: { select: { assets: true } },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { name, icon, color, customAttributes } = req.body;

    if (!name) {
      throw new ApiError(400, "Category name is required");
    }

    const category = await db.assetCategory.create({
      data: {
        organizationId,
        name: String(name),
        icon: icon ? String(icon) : null,
        color: color ? String(color) : null,
        customAttributes: customAttributes || null,
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "AssetCategory",
      entityId: category.id,
      action: "CREATED",
      metadata: req.body,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { name, icon, color, customAttributes } = req.body;

    const existing = await db.assetCategory.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Category not found");
    }

    const updated = await db.assetCategory.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(icon !== undefined && { icon: icon ? String(icon) : null }),
        ...(color !== undefined && { color: color ? String(color) : null }),
        ...(customAttributes !== undefined && { customAttributes }),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "AssetCategory",
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

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.assetCategory.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { assets: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Category not found");
    }

    if (existing._count.assets > 0) {
      throw new ApiError(400, "Cannot delete category containing assets.");
    }

    await db.assetCategory.delete({
      where: { id: existing.id },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "AssetCategory",
      entityId: id,
      action: "DELETED",
      metadata: { name: existing.name },
    });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
