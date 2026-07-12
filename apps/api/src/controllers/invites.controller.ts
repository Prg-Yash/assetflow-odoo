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
      // 1. Update legacy User fields (backward compat)
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: invite.organizationId,
          roleId: invite.roleId,
        },
      });

      // 2. Check if membership already exists (e.g. accepted duplicate invite)
      const existingMembership = await tx.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: invite.organizationId,
            userId,
          },
        },
      });

      if (!existingMembership) {
        // 3. Create the M:N OrganizationMember row with the invited role
        const isFirstOrg = await tx.organizationMember.count({ where: { userId } }) === 0;
        await tx.organizationMember.create({
          data: {
            organizationId: invite.organizationId,
            userId,
            roleId: invite.roleId,  // The exact role Admin chose when sending the invite
            isDefault: isFirstOrg,
          },
        });

        // 4. Generate auto employee code
        const empCount = await tx.employee.count({ where: { organizationId: invite.organizationId } });
        const employeeCode = `EMP-${String(empCount + 1).padStart(4, "0")}`;

        // 5. Create Employee profile inside the organization
        await tx.employee.create({
          data: {
            organizationId: invite.organizationId,
            userId,
            employeeCode,
            designation: invite.role.name,
            isActive: true,
          },
        });
      }

      // 6. Mark invite as accepted
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
