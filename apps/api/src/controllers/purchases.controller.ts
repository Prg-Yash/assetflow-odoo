import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getPurchases = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const purchases = await db.purchase.findMany({
      where: { organizationId },
      include: {
        vendor: { select: { id: true, name: true } },
        _count: { select: { assets: true } },
      },
      orderBy: { purchaseDate: "desc" },
    });

    res.status(200).json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    next(error);
  }
};

export const createPurchase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { vendorId, invoiceNo, purchaseDate, totalCost } = req.body;

    if (!purchaseDate || totalCost === undefined) {
      throw new ApiError(400, "purchaseDate and totalCost are required");
    }

    const purchase = await db.purchase.create({
      data: {
        organizationId,
        vendorId: vendorId ? String(vendorId) : null,
        invoiceNo: invoiceNo ? String(invoiceNo) : null,
        purchaseDate: new Date(purchaseDate),
        totalCost: Number(totalCost),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Purchase",
      entityId: purchase.id,
      action: "CREATED",
      metadata: req.body,
    });

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePurchase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { vendorId, invoiceNo, purchaseDate, totalCost } = req.body;

    const existing = await db.purchase.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Purchase order not found");
    }

    const updated = await db.purchase.update({
      where: { id: existing.id },
      data: {
        ...(vendorId !== undefined && { vendorId: vendorId ? String(vendorId) : null }),
        ...(invoiceNo !== undefined && { invoiceNo: invoiceNo ? String(invoiceNo) : null }),
        ...(purchaseDate !== undefined && { purchaseDate: new Date(purchaseDate) }),
        ...(totalCost !== undefined && { totalCost: Number(totalCost) }),
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Purchase",
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

export const deletePurchase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.purchase.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Purchase not found");
    }

    await db.purchase.delete({
      where: { id: existing.id },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Purchase",
      entityId: id,
      action: "DELETED",
      metadata: { invoiceNo: existing.invoiceNo },
    });

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
