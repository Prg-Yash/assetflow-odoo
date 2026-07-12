import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getAssets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
    const locationId = typeof req.query.locationId === "string" ? req.query.locationId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(categoryId && { categoryId }),
      ...(departmentId && { departmentId }),
      ...(locationId && { locationId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { assetCode: { contains: search, mode: "insensitive" } },
          { serialNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const assets = await db.asset.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        vendor: { select: { id: true, name: true } },
        _count: { select: { images: true, documents: true, maintenanceRequests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const asset = await db.asset.findFirst({
      where: { id, organizationId },
      include: {
        category: true,
        department: true,
        location: true,
        vendor: true,
        purchase: true,
        images: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        qrCode: true,
        allocations: {
          include: {
            employee: {
              include: {
                user: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { allocatedAt: "desc" },
          take: 10,
        },
        maintenanceRequests: {
          include: {
            raisedBy: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
          },
          orderBy: { openedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!asset) {
      throw new ApiError(404, "Asset not found in your organization");
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const {
      name,
      assetCode,
      serialNumber,
      description,
      categoryId,
      departmentId,
      locationId,
      vendorId,
      purchaseId,
      purchaseCost,
      status,
      condition,
      isShared,
      customValues,
    } = req.body;

    if (!name || !assetCode || !categoryId) {
      throw new ApiError(400, "name, assetCode, and categoryId are required");
    }

    const existingCode = await db.asset.findFirst({
      where: { organizationId, assetCode: String(assetCode) },
    });
    if (existingCode) {
      throw new ApiError(409, `Asset code '${assetCode}' already exists in your organization`);
    }

    const asset = await db.$transaction(async (tx) => {
      const createdAsset = await tx.asset.create({
        data: {
          organizationId,
          name: String(name),
          assetCode: String(assetCode),
          serialNumber: serialNumber ? String(serialNumber) : null,
          description: description ? String(description) : null,
          categoryId: String(categoryId),
          departmentId: departmentId ? String(departmentId) : null,
          locationId: locationId ? String(locationId) : null,
          vendorId: vendorId ? String(vendorId) : null,
          purchaseId: purchaseId ? String(purchaseId) : null,
          purchaseCost: purchaseCost !== undefined ? Number(purchaseCost) : null,
          status: status || "AVAILABLE",
          condition: condition || "GOOD",
          isShared: Boolean(isShared),
          customValues: customValues || null,
          createdBy: req.user?.id || null,
        },
        include: {
          category: true,
          department: true,
          location: true,
        },
      });

      const qrCodeString = `AF-QR-${createdAsset.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await tx.qRCode.create({
        data: {
          assetId: createdAsset.id,
          code: qrCodeString,
        },
      });

      return createdAsset;
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Asset",
      entityId: asset.id,
      action: "CREATED",
      metadata: { assetCode: asset.assetCode, name: asset.name, status: asset.status },
    });

    res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const {
      name,
      serialNumber,
      description,
      categoryId,
      departmentId,
      locationId,
      vendorId,
      purchaseId,
      purchaseCost,
      status,
      condition,
      isShared,
      customValues,
    } = req.body;

    const existing = await db.asset.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Asset not found");
    }

    const updated = await db.asset.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(serialNumber !== undefined && { serialNumber: serialNumber ? String(serialNumber) : null }),
        ...(description !== undefined && { description: description ? String(description) : null }),
        ...(categoryId !== undefined && { categoryId: String(categoryId) }),
        ...(departmentId !== undefined && { departmentId: departmentId ? String(departmentId) : null }),
        ...(locationId !== undefined && { locationId: locationId ? String(locationId) : null }),
        ...(vendorId !== undefined && { vendorId: vendorId ? String(vendorId) : null }),
        ...(purchaseId !== undefined && { purchaseId: purchaseId ? String(purchaseId) : null }),
        ...(purchaseCost !== undefined && { purchaseCost: purchaseCost !== null ? Number(purchaseCost) : null }),
        ...(status !== undefined && { status }),
        ...(condition !== undefined && { condition }),
        ...(isShared !== undefined && { isShared: Boolean(isShared) }),
        ...(customValues !== undefined && { customValues }),
        updatedBy: req.user?.id || null,
      },
      include: {
        category: true,
        department: true,
        location: true,
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Asset",
      entityId: id,
      action: "UPDATED",
      metadata: { changes: req.body },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.asset.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new ApiError(404, "Asset not found");
    }

    if (existing.status === "ALLOCATED" || existing.status === "UNDER_MAINTENANCE") {
      throw new ApiError(400, `Cannot delete asset that is currently ${existing.status}. Please return or resolve first.`);
    }

    await db.asset.delete({
      where: { id: existing.id },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Asset",
      entityId: id,
      action: "DELETED",
      metadata: { assetCode: existing.assetCode, name: existing.name },
    });

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const addAssetImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { url } = req.body;

    if (!url) {
      throw new ApiError(400, "Image url is required");
    }

    const asset = await db.asset.findFirst({
      where: { id, organizationId },
    });
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const image = await db.assetImage.create({
      data: {
        assetId: id,
        url: String(url),
      },
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    next(error);
  }
};

export const addAssetDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { type, url } = req.body;

    if (!type || !url) {
      throw new ApiError(400, "Document type and url are required");
    }

    const asset = await db.asset.findFirst({
      where: { id, organizationId },
    });
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const doc = await db.assetDocument.create({
      data: {
        assetId: id,
        type: String(type),
        url: String(url),
      },
    });

    res.status(201).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const scanQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const code = String(req.params.code);

    const qr = await db.qRCode.findUnique({
      where: { code },
      include: {
        asset: {
          include: {
            category: true,
            department: true,
            location: true,
            allocations: {
              where: { status: "ACTIVE" },
              include: { employee: { include: { user: { select: { name: true, email: true } } } } },
              take: 1,
            },
          },
        },
      },
    });

    if (!qr || !qr.asset || qr.asset.organizationId !== organizationId) {
      throw new ApiError(404, "Invalid QR code or asset does not belong to your organization");
    }

    res.status(200).json({
      success: true,
      data: qr.asset,
    });
  } catch (error) {
    next(error);
  }
};
