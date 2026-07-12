import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";
import crypto from "crypto";

export const getInvites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const invites = await db.invite.findMany({
      where: { organizationId },
      include: {
        role: { select: { id: true, name: true, roleType: true } },
        invitedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: invites,
    });
  } catch (error) {
    next(error);
  }
};

export const createInvite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { email, roleId } = req.body;

    if (!email || !roleId) {
      throw new ApiError(400, "email and roleId are required");
    }

    const role = await db.role.findFirst({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new ApiError(404, "Role not found in organization");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await db.invite.create({
      data: {
        organizationId,
        email,
        roleId,
        invitedById: req.user?.id || null,
        token,
        expiresAt,
      },
      include: { role: true },
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Invite",
      entityId: invite.id,
      action: "CREATED",
      metadata: { email, roleName: role.name },
    });

    res.status(201).json({
      success: true,
      data: invite,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new ApiError(400, "Invite token is required");
    }

    const invite = await db.invite.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invite || invite.accepted) {
      throw new ApiError(400, "Invalid or already accepted invite token");
    }

    if (new Date() > invite.expiresAt) {
      throw new ApiError(400, "Invite token has expired");
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Must be logged in to accept organization invite");
    }

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: invite.organizationId,
          roleId: invite.roleId,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { accepted: true },
      });
    });

    await recordActivityLog({
      organizationId: invite.organizationId,
      userId,
      entity: "Invite",
      entityId: invite.id,
      action: "ACCEPTED",
      metadata: { email: invite.email },
    });

    res.status(200).json({
      success: true,
      message: "Successfully joined organization",
    });
  } catch (error) {
    next(error);
  }
};
