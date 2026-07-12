import { Request, Response, NextFunction } from "express";
import { auth } from "@repo/auth";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { ApiError } from "./error.middleware.js";

export interface AuthRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  organizationId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employeeProfile?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  role?: any;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      throw new ApiError(401, "Unauthorized: No active session found");
    }

    req.session = session.session;
    req.user = session.user;

    const targetOrgIdHeader = req.headers["x-organization-id"];
    const requestedOrgId =
      typeof targetOrgIdHeader === "string"
        ? targetOrgIdHeader
        : session.user.organizationId || session.session.activeOrganizationId;

    if (req.user.id) {
      // 1. If an explicit or active organization is targeted, check M:N membership join table
      if (requestedOrgId) {
        const membership = await db.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: String(requestedOrgId),
              userId: req.user.id,
            },
          },
          include: {
            role: { include: { permissions: true } },
          },
        });

        if (membership) {
          req.organizationId = membership.organizationId;
          req.role = membership.role;
          req.employeeProfile = await db.employee.findFirst({
            where: { userId: req.user.id, organizationId: membership.organizationId },
          });
          return next();
        }
      }

      // 2. If requested target wasn't found in membership join table, pick user's first available membership
      const firstMembership = await db.organizationMember.findFirst({
        where: { userId: req.user.id },
        include: {
          role: { include: { permissions: true } },
        },
        orderBy: { joinedAt: "asc" },
      });

      if (firstMembership) {
        req.organizationId = firstMembership.organizationId;
        req.role = firstMembership.role;
        req.employeeProfile = await db.employee.findFirst({
          where: { userId: req.user.id, organizationId: firstMembership.organizationId },
        });
        return next();
      }

      // 3. Fallback to legacy 1:N User fields if no membership rows exist
      const fullUser = await db.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: { include: { permissions: true } },
          employeeProfile: true,
        },
      });

      if (fullUser) {
        req.role = fullUser.role;
        req.employeeProfile = fullUser.employeeProfile;
        if (fullUser.organizationId) {
          req.organizationId = fullUser.organizationId;
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireOrganization(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  await requireAuth(req, res, async (err) => {
    if (err) return next(err);
    if (!req.organizationId) {
      return next(new ApiError(403, "Forbidden: User does not belong to an active organization"));
    }
    next();
  });
}

export function requireRoleType(...allowedRoleTypes: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    await requireOrganization(req, res, async (err) => {
      if (err) return next(err);
      if (!req.role || !allowedRoleTypes.includes(req.role.roleType)) {
        return next(new ApiError(403, `Forbidden: Requires role [${allowedRoleTypes.join(", ")}]`));
      }
      next();
    });
  };
}

export function requirePermission(permissionName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    await requireOrganization(req, res, async (err) => {
      if (err) return next(err);
      const perms = req.role?.permissions || [];
      const hasPerm = perms.some((p: { name: string }) => p.name === permissionName);
      if (!hasPerm && req.role?.roleType !== "ADMIN") {
        return next(new ApiError(403, `Forbidden: Missing required permission '${permissionName}'`));
      }
      next();
    });
  };
}
