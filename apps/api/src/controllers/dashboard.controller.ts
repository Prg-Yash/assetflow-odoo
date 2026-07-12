import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { db } from "@repo/db";

export const getDashboardKPIs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceAssets,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      overdueAllocations,
    ] = await Promise.all([
      db.asset.count({ where: { organizationId, status: { not: "DISPOSED" } } }),
      db.asset.count({ where: { organizationId, status: "AVAILABLE" } }),
      db.asset.count({ where: { organizationId, status: "ALLOCATED" } }),
      db.asset.count({ where: { organizationId, status: "UNDER_MAINTENANCE" } }),
      db.maintenanceRequest.count({
        where: { organizationId, openedAt: { gte: startOfToday } },
      }),
      db.booking.count({
        where: { organizationId, status: { in: ["APPROVED", "ACTIVE"] }, endTime: { gt: now } },
      }),
      db.transferRequest.count({
        where: { organizationId, status: "PENDING" },
      }),
      db.allocation.count({
        where: {
          organizationId,
          status: "ACTIVE",
          expectedReturn: { lt: now },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        availableAssets,
        allocatedAssets,
        maintenanceAssets,
        maintenanceToday,
        activeBookings,
        pendingTransfers,
        overdueReturns: overdueAllocations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueAllocations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const now = new Date();

    const overdue = await db.allocation.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        expectedReturn: { lt: now },
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { expectedReturn: "asc" },
    });

    res.status(200).json({
      success: true,
      data: overdue,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingReturns = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const now = new Date();

    const upcoming = await db.allocation.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        expectedReturn: { gte: now },
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        employee: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { expectedReturn: "asc" },
      take: 20,
    });

    res.status(200).json({
      success: true,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};

export const getUtilizationReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const categories = await db.assetCategory.findMany({
      where: { organizationId },
      include: {
        assets: {
          select: { status: true, purchaseCost: true },
        },
      },
    });

    const data = categories.map((cat) => {
      const total = cat.assets.length;
      const allocated = cat.assets.filter((a) => a.status === "ALLOCATED").length;
      const available = cat.assets.filter((a) => a.status === "AVAILABLE").length;
      const maintenance = cat.assets.filter((a) => a.status === "UNDER_MAINTENANCE").length;
      const totalValue = cat.assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
      const utilizationRate = total > 0 ? Math.round((allocated / total) * 100) : 0;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalAssets: total,
        allocated,
        available,
        maintenance,
        totalValue,
        utilizationRate,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentAllocationsReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const departments = await db.department.findMany({
      where: { organizationId },
      include: {
        employees: {
          include: {
            allocations: {
              where: { status: "ACTIVE" },
              include: { asset: { select: { purchaseCost: true } } },
            },
          },
        },
      },
    });

    const data = departments.map((dept) => {
      let activeAllocationsCount = 0;
      let totalAllocatedValue = 0;

      dept.employees.forEach((emp) => {
        activeAllocationsCount += emp.allocations.length;
        emp.allocations.forEach((alloc) => {
          totalAllocatedValue += alloc.asset.purchaseCost || 0;
        });
      });

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        employeeCount: dept.employees.length,
        activeAllocationsCount,
        totalAllocatedValue,
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceFrequencyReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = req.organizationId!;
    const maintenance = await db.maintenanceRequest.findMany({
      where: { organizationId },
      include: {
        asset: { include: { category: { select: { name: true } } } },
      },
    });

    const byCategory: Record<string, { totalRequests: number; totalCost: number }> = {};
    maintenance.forEach((req) => {
      const catName = req.asset.category.name;
      if (!byCategory[catName]) {
        byCategory[catName] = { totalRequests: 0, totalCost: 0 };
      }
      byCategory[catName].totalRequests += 1;
      byCategory[catName].totalCost += req.cost || 0;
    });

    res.status(200).json({
      success: true,
      data: byCategory,
    });
  } catch (error) {
    next(error);
  }
};
