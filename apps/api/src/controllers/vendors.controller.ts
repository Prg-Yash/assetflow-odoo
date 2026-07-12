import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getVendors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const vendors = await db.vendor.findMany({
      where: { organizationId },
      include: {
        _count: { select: { assets: true, purchases: true } },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};

export const createVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { name, email, phone, address } = req.body;

    if (!name) {
      throw new ApiError(400, "Vendor name is required");
    }

    const vendor = await db.vendor.create({
      data: {
        organizationId,
        name: String(name),
        email: email ? String(email) : null,
        phone: phone ? String(phone) : null,
        address: address ? String(address) : null,
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Vendor",
      entityId: vendor.id,
      action: "CREATED",
      metadata: req.body,
    });

    res.status(201).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { name, email, phone, address } = req.body;

    const existing = await db.vendor.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Vendor not found");
    }

    const updated = await db.vendor.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(email !== undefined && { email: email ? String(email) : null }),
        ...(phone !== undefined && { phone: phone ? String(phone) : null }),
        ...(address !== undefined && { address: address ? String(address) : null }),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Vendor",
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

export const deleteVendor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.vendor.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Vendor not found");
    }

    await db.vendor.delete({
      where: { id: existing.id },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Vendor",
      entityId: id,
      action: "DELETED",
      metadata: { name: existing.name },
    });

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
