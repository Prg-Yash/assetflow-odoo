import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getLocations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const locations = await db.location.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { assets: true, childLocations: true },
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { name, parentLocationId } = req.body;

    if (!name) {
      throw new ApiError(400, "Location name is required");
    }

    const location = await db.location.create({
      data: {
        organizationId,
        name: String(name),
        parentLocationId: parentLocationId ? String(parentLocationId) : null,
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Location",
      entityId: location.id,
      action: "CREATED",
      metadata: req.body,
    });

    res.status(201).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { name, parentLocationId } = req.body;

    const existing = await db.location.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Location not found");
    }

    const updated = await db.location.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(parentLocationId !== undefined && {
          parentLocationId: parentLocationId ? String(parentLocationId) : null,
        }),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Location",
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

export const deleteLocation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.location.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { assets: true, childLocations: true } } },
    });

    if (!existing) {
      throw new ApiError(404, "Location not found");
    }

    if (existing._count.assets > 0 || existing._count.childLocations > 0) {
      throw new ApiError(400, "Cannot delete location containing assets or child locations.");
    }

    await db.location.delete({
      where: { id: existing.id },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Location",
      entityId: id,
      action: "DELETED",
      metadata: { name: existing.name },
    });

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
