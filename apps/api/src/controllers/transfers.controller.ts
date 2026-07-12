import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog, createNotification } from "../utils/activity.util.js";

export const getTransfers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const assetId = typeof req.query.assetId === "string" ? req.query.assetId : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      organizationId,
      ...(status && { status }),
      ...(assetId && { assetId }),
    };

    if (req.role?.roleType === "EMPLOYEE" && req.employeeProfile) {
      where.OR = [
        { fromEmployeeId: req.employeeProfile.id },
        { toEmployeeId: req.employeeProfile.id },
        { requestedById: req.user?.id },
      ];
    } else if (req.role?.roleType === "DEPARTMENT_HEAD" && req.employeeProfile?.departmentId) {
      where.OR = [
        { fromEmployee: { departmentId: req.employeeProfile.departmentId } },
        { toEmployee: { departmentId: req.employeeProfile.departmentId } },
      ];
    }

    const transfers = await db.transferRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        fromEmployee: { include: { user: { select: { id: true, name: true, email: true } } } },
        toEmployee: { include: { user: { select: { id: true, name: true, email: true } } } },
        requestedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: transfers,
    });
  } catch (error) {
    next(error);
  }
};

export const createTransferRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { assetId, toEmployeeId, reason, expectedReturnAt } = req.body;

    if (!assetId || !toEmployeeId) {
      throw new ApiError(400, "assetId and toEmployeeId are required");
    }

    const asset = await db.asset.findFirst({
      where: { id: String(assetId), organizationId },
    });

    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const activeAlloc = await db.allocation.findFirst({
      where: { assetId: String(assetId), status: "ACTIVE" },
      include: { employee: { include: { user: true } } },
    });

    if (!activeAlloc) {
      throw new ApiError(400, "Asset is not currently allocated to anyone. You can allocate it directly without a transfer request.");
    }

    if (activeAlloc.employeeId === String(toEmployeeId)) {
      throw new ApiError(400, "Asset is already allocated to this target employee.");
    }

    const toEmp = await db.employee.findFirst({
      where: { id: String(toEmployeeId), organizationId },
      include: { user: true },
    });

    if (!toEmp) {
      throw new ApiError(404, "Target employee not found");
    }

    const transfer = await db.transferRequest.create({
      data: {
        organizationId,
        assetId: String(assetId),
        fromEmployeeId: activeAlloc.employeeId,
        toEmployeeId: String(toEmployeeId),
        requestedById: req.user?.id || null,
        reason: reason || null,
        expectedReturnAt: expectedReturnAt ? new Date(expectedReturnAt) : null,
        status: "PENDING",
      },
      include: {
        asset: true,
        fromEmployee: { include: { user: true } },
        toEmployee: { include: { user: true } },
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "TransferRequest",
      entityId: transfer.id,
      action: "REQUESTED",
      metadata: { assetCode: asset.assetCode, from: activeAlloc.employee.user.name, to: toEmp.user.name },
    });

    await createNotification({
      organizationId,
      userId: activeAlloc.employee.userId,
      title: "Asset Transfer Requested",
      body: `A transfer request has been initiated to move ${asset.name} (${asset.assetCode}) from you to ${toEmp.user.name}.`,
      type: "TRANSFER_REQUESTED",
    });

    res.status(201).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    next(error);
  }
};

export const approveTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const transfer = await db.transferRequest.findFirst({
      where: { id, organizationId, status: "PENDING" },
      include: {
        asset: true,
        fromEmployee: { include: { user: true } },
        toEmployee: { include: { user: true } },
      },
    });

    if (!transfer) {
      throw new ApiError(404, "Pending transfer request not found");
    }

    const result = await db.$transaction(async (tx) => {
      const updatedTransfer = await tx.transferRequest.update({
        where: { id: transfer.id },
        data: {
          status: "APPROVED",
          approvedById: req.user?.id || null,
        },
      });

      await tx.allocation.updateMany({
        where: { assetId: transfer.assetId, status: "ACTIVE" },
        data: {
          status: "RETURNED",
          returnedAt: new Date(),
          remarks: `Auto-closed due to approved transfer request #${transfer.id}`,
        },
      });

      const newAllocation = await tx.allocation.create({
        data: {
          organizationId,
          assetId: transfer.assetId,
          employeeId: transfer.toEmployeeId,
          allocatedById: req.user?.id || null,
          expectedReturn: transfer.expectedReturnAt || null,
          status: "ACTIVE",
          remarks: `Auto-allocated from approved transfer request #${transfer.id} (transferred from ${transfer.fromEmployee.user.name})`,
        },
      });

      return { updatedTransfer, newAllocation };
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "TransferRequest",
      entityId: id,
      action: "APPROVED_AND_REALLOCATED",
      metadata: { assetCode: transfer.asset.assetCode, newAllocationId: result.newAllocation.id },
    });

    await createNotification({
      organizationId,
      userId: transfer.toEmployee.userId,
      title: "Transfer Approved - Asset Assigned",
      body: `You are now assigned asset ${transfer.asset.name} (${transfer.asset.assetCode}).`,
      type: "TRANSFER_APPROVED",
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTransfer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const { reason } = req.body;

    const transfer = await db.transferRequest.findFirst({
      where: { id, organizationId, status: "PENDING" },
    });

    if (!transfer) {
      throw new ApiError(404, "Pending transfer request not found");
    }

    const rejected = await db.transferRequest.update({
      where: { id: transfer.id },
      data: {
        status: "REJECTED",
        approvedById: req.user?.id || null,
        reason: reason || transfer.reason,
      },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "TransferRequest",
      entityId: id,
      action: "REJECTED",
      metadata: { reason },
    });

    res.status(200).json({
      success: true,
      data: rejected,
    });
  } catch (error) {
    next(error);
  }
};
