import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";
import { ApiError } from "../middleware/error.middleware.js";
import { recordActivityLog } from "../utils/activity.util.js";

export const getUserOrganizations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorized");
    }

    const memberships = await db.organizationMember.findMany({
      where: { userId: req.user.id },
      include: {
        organization: {
          include: {
            settings: true,
            _count: {
              select: {
                users: true,
                assets: true,
                departments: true,
                locations: true,
              },
            },
          },
        },
        role: true,
      },
      orderBy: { joinedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: memberships.map((m) => ({
        membershipId: m.id,
        isDefault: m.isDefault,
        joinedAt: m.joinedAt,
        role: m.role,
        organization: m.organization,
        isActive: req.organizationId === m.organizationId,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorized");
    }

    const { name, slug, logo, phone, website, makeActive } = req.body;

    if (!name) {
      throw new ApiError(400, "Organization name is required");
    }

    const orgSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 7);

    const existingSlug = await db.organization.findUnique({
      where: { slug: orgSlug },
    });
    if (existingSlug) {
      throw new ApiError(409, `Organization slug '${orgSlug}' is already taken`);
    }

    const newOrg = await db.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: String(name),
          slug: orgSlug,
          logo: logo ? String(logo) : null,
          phone: phone ? String(phone) : null,
          website: website ? String(website) : null,
        },
      });

      // 2. Create System Roles for this Organization
      const adminRole = await tx.role.create({
        data: {
          organizationId: org.id,
          name: "Admin",
          description: "Full system administration and control over all assets and settings.",
          roleType: "ADMIN",
          isSystem: true,
          permissions: {
            create: [
              { name: "asset:manage", description: "Full asset management" },
              { name: "booking:manage", description: "Full booking control" },
              { name: "audit:manage", description: "Full audit management" },
              { name: "settings:manage", description: "Organization settings management" },
            ],
          },
        },
      });

      await tx.role.create({
        data: {
          organizationId: org.id,
          name: "Asset Manager",
          description: "Can manage assets, allocations, transfers, and maintenance.",
          roleType: "ASSET_MANAGER",
          isSystem: true,
        },
      });

      await tx.role.create({
        data: {
          organizationId: org.id,
          name: "Auditor",
          description: "Can conduct audits, inspect assets, and generate compliance reports.",
          roleType: "AUDITOR",
          isSystem: true,
        },
      });

      await tx.role.create({
        data: {
          organizationId: org.id,
          name: "Employee",
          description: "Standard staff member who can hold assets and request bookings/maintenance.",
          roleType: "EMPLOYEE",
          isSystem: true,
        },
      });

      // 3. Create Settings
      await tx.settings.create({
        data: {
          organizationId: org.id,
          theme: "dark",
          timezone: "UTC",
          currency: "USD",
          language: "en",
        },
      });

      // 4. Create M:N Membership linking current User as Admin of this new Org
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: req.user.id,
          roleId: adminRole.id,
          isDefault: true,
        },
      });

      // 5. Create Employee profile inside the new organization
      await tx.employee.create({
        data: {
          organizationId: org.id,
          userId: req.user.id,
          employeeCode: "EMP-0001",
          designation: "Administrator & Founder",
          isActive: true,
        },
      });

      // 6. Optionally set as user's currently active organization
      if (makeActive !== false) {
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            organizationId: org.id,
            roleId: adminRole.id,
          },
        });
      }

      return org;
    });

    await recordActivityLog({
      organizationId: newOrg.id,
      userId: req.user.id,
      entity: "Organization",
      entityId: newOrg.id,
      action: "CREATED",
      metadata: { name: newOrg.name, slug: newOrg.slug },
    });

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      data: newOrg,
    });
  } catch (error) {
    next(error);
  }
};

export const switchActiveOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      throw new ApiError(401, "Unauthorized");
    }

    const { organizationId } = req.body;
    if (!organizationId) {
      throw new ApiError(400, "organizationId is required to switch workspaces");
    }

    const membership = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: String(organizationId),
          userId: req.user.id,
        },
      },
      include: {
        role: true,
        organization: { include: { settings: true } },
      },
    });

    if (!membership) {
      throw new ApiError(403, "Forbidden: You are not a member of this organization");
    }

    await db.$transaction(async (tx) => {
      // Update User legacy pointers to new active workspace
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          organizationId: membership.organizationId,
          roleId: membership.roleId,
        },
      });

      // If active session token is present, store activeOrganizationId in Session
      if (req.session && req.session.token) {
        await tx.session.update({
          where: { token: req.session.token },
          data: { activeOrganizationId: membership.organizationId },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: `Switched active organization to ${membership.organization.name}`,
      data: {
        organization: membership.organization,
        role: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscription: true,
        settings: true,
        _count: {
          select: {
            users: true,
            departments: true,
            assets: true,
            locations: true,
          },
        },
      },
    });

    if (!org) {
      throw new ApiError(404, "Organization not found");
    }

    res.status(200).json({
      success: true,
      data: org,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrganizationSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const { name, logo, phone, website, settings } = req.body;

    const updatedOrg = await db.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id: organizationId },
        data: {
          ...(name !== undefined && { name: String(name) }),
          ...(logo !== undefined && { logo: logo ? String(logo) : null }),
          ...(phone !== undefined && { phone: phone ? String(phone) : null }),
          ...(website !== undefined && { website: website ? String(website) : null }),
        },
      });

      if (settings) {
        await tx.settings.upsert({
          where: { organizationId },
          create: {
            organizationId,
            theme: settings.theme || "dark",
            timezone: settings.timezone || "UTC",
            currency: settings.currency || "USD",
            language: settings.language || "en",
            smtpConfig: settings.smtpConfig || null,
            branding: settings.branding || null,
          },
          update: {
            ...(settings.theme && { theme: settings.theme }),
            ...(settings.timezone && { timezone: settings.timezone }),
            ...(settings.currency && { currency: settings.currency }),
            ...(settings.language && { language: settings.language }),
            ...(settings.smtpConfig !== undefined && { smtpConfig: settings.smtpConfig }),
            ...(settings.branding !== undefined && { branding: settings.branding }),
          },
        });
      }

      return tx.organization.findUnique({
        where: { id: organizationId },
        include: { settings: true },
      });
    });

    await recordActivityLog({
      organizationId,
      userId: req.user?.id,
      entity: "Organization",
      entityId: organizationId,
      action: "UPDATED_SETTINGS",
      metadata: req.body,
    });

    res.status(200).json({
      success: true,
      data: updatedOrg,
    });
  } catch (error) {
    next(error);
  }
};
