import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog, createNotification } from "../utils/activity.util.js";
import { queueService } from "../services/queue.service.js";

export const getBookings = async (
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

    if (req.role?.roleType === "EMPLOYEE" && req.employeeProfile) {
      where.employeeId = req.employeeProfile.id;
    } else if (req.role?.roleType === "DEPARTMENT_HEAD" && req.employeeProfile?.departmentId) {
      where.employee = { departmentId: req.employeeProfile.departmentId };
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true, isShared: true } },
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAssetCalendar = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const assetId = String(req.params.assetId);

    const bookings = await db.booking.findMany({
      where: {
        organizationId,
        assetId,
        status: { in: ["APPROVED", "ACTIVE", "PENDING"] },
      },
      include: {
        employee: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
    });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { assetId, employeeId, startTime, endTime, purpose } = req.body;

    if (!assetId || !employeeId || !startTime || !endTime) {
      throw new ApiError(400, "assetId, employeeId, startTime, and endTime are required");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      throw new ApiError(400, "startTime must be earlier than endTime");
    }

    const asset = await db.asset.findFirst({
      where: { id: String(assetId), organizationId },
    });

    if (!asset) {
      throw new ApiError(404, "Shared resource/asset not found");
    }

    if (!asset.isShared) {
      throw new ApiError(400, `Asset ${asset.name} is not marked as a shared/bookable resource.`);
    }

    const overlapping = await db.booking.findFirst({
      where: {
        assetId: String(assetId),
        status: { in: ["APPROVED", "ACTIVE"] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      include: { employee: { include: { user: { select: { name: true } } } } },
    });

    if (overlapping) {
      const bookedBy = overlapping.employee.user.name;
      throw new ApiError(
        409,
        `Overlap conflict: ${asset.name} is already booked from ${overlapping.startTime.toLocaleTimeString()} to ${overlapping.endTime.toLocaleTimeString()} by ${bookedBy}.`
      );
    }

    const booking = await db.booking.create({
      data: {
        organizationId,
        assetId: String(assetId),
        employeeId: String(employeeId),
        startTime: start,
        endTime: end,
        purpose: purpose ? String(purpose) : null,
        status: "APPROVED",
      },
      include: { asset: true, employee: { include: { user: true } } },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Booking",
      entityId: booking.id,
      action: "BOOKED_SLOT",
      metadata: { assetName: asset.name, start, end, purpose },
    });

    await createNotification({
      organizationId,
      userId: booking.employee.userId,
      title: "Booking Confirmed",
      body: `Your time-slot booking for ${asset.name} (${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}) has been confirmed.`,
      type: "BOOKING_CONFIRMED",
    });

    // Enqueue background booking reminder (`booking-queue` -> apps/worker)
    queueService.enqueue({
      type: "BOOKING_REMINDER",
      data: {
        bookingId: booking.id,
        userId: booking.employee.userId,
        userEmail: booking.employee.user.email,
        assetName: asset.name,
        startTime: start.toISOString(),
      },
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);

    const existing = await db.booking.findFirst({
      where: { id, organizationId },
      include: { asset: true },
    });

    if (!existing) {
      throw new ApiError(404, "Booking not found");
    }

    const cancelled = await db.booking.update({
      where: { id: existing.id },
      data: { status: "CANCELLED" },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Booking",
      entityId: id,
      action: "CANCELLED",
      metadata: { assetName: existing.asset.name },
    });

    res.status(200).json({
      success: true,
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};
