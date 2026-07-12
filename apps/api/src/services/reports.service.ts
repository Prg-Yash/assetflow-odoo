import { db } from "@repo/db";

export type ReportRangeKey =
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_6_months"
  | "last_year"
  | "custom";

export interface ReportFilters {
  range: ReportRangeKey;
  startDate: Date;
  endDate: Date;
  idleDays: number;
}

type AssetStatusCount = {
  totalAssets: number;
  activeAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  underMaintenanceAssets: number;
  retiredAssets: number;
};

type CountGroup<Key extends string> = Record<Key, string> & { _count: { _all: number } };
type MaintenanceRow = { openedAt: Date; cost: number | null; status: string };
type DepartmentRow = {
  id: string;
  name: string;
  _count: { assets: number };
  employees: Array<{ id: string; user: { name: string } }>;
};
type CategoryRow = { id: string; name: string; customAttributes: unknown; _count: { assets: number } };
type ReportAssetRow = {
  id: string;
  name: string;
  assetCode: string;
  status: string;
  departmentId: string | null;
  categoryId: string;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  currentValue: number | null;
  warrantyExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
  department: { name: string } | null;
  category: { name: string; customAttributes: unknown } | null;
  bookings: Array<{ endTime: Date }>;
  allocations: Array<{ allocatedAt: Date; returnedAt: Date | null }>;
  maintenanceRequests: Array<{ openedAt: Date; status: string }>;
};
type EmployeeRow = {
  id: string;
  departmentId: string | null;
  user: { name: string };
  department: { id: string; name: string } | null;
};
type DateRow<Key extends string> = Record<Key, Date>;

export interface ReportDashboard {
  generatedAt: string;
  filters: {
    range: ReportRangeKey;
    startDate: string;
    endDate: string;
    idleDays: number;
  };
  assetSummary: AssetStatusCount;
  utilizationByDepartment: Array<{ name: string; value: number; bookingCount: number; allocationCount: number; assetCount: number }>;
  maintenanceFrequency: Array<{ label: string; value: number; cost: number }>;
  mostUsedAssets: Array<{ assetId: string; assetName: string; assetCode: string; usageCount: number; department: string }>;
  idleAssets: Array<{ assetId: string; assetName: string; assetCode: string; idleDays: number; department: string }>;
  maintenanceDue: Array<{ assetId: string; assetName: string; assetCode: string; detail: string; department: string; type: "MAINTENANCE" | "RETIREMENT" }>;
  bookingTrends: Array<{ label: string; value: number }>;
  assetGrowthOverTime: Array<{ label: string; value: number }>;
  departmentAssetDistribution: Array<{ name: string; value: number }>;
  categoryAssetDistribution: Array<{ name: string; value: number }>;
  bookingHeatmap: Array<{ day: string; hour: number; value: number }>;
  mostActiveEmployees: Array<{ employeeId: string; employeeName: string; department: string; usageCount: number }>;
  topDepartmentsByUsage: Array<{ departmentId: string; departmentName: string; usageCount: number }>;
  maintenanceCostSummary: { totalCost: number; averageCost: number; requestCount: number };
  assetDepreciationSummary: { purchaseValue: number; currentValue: number; depreciationValue: number; depreciationRate: number };
  approvalRequestStatistics: { total: number; pending: number; approved: number; rejected: number };
  assetAllocationTrends: Array<{ label: string; value: number }>;
}

const ACTIVE_ASSET_STATUSES = ["AVAILABLE", "ALLOCATED", "RESERVED", "UNDER_MAINTENANCE", "IN_AUDIT"] as const;
const BOOKING_USAGE_STATUSES = ["APPROVED", "ACTIVE", "COMPLETED"] as const;
const ALLOCATION_USAGE_STATUSES = ["ACTIVE", "RETURNED", "OVERDUE"] as const;

export function parseReportFilters(query: Record<string, unknown>): ReportFilters {
  const range = normalizeRange(typeof query.range === "string" ? query.range : undefined);
  const now = new Date();
  const endDate = endOfDay(parseDate(typeof query.endDate === "string" ? query.endDate : undefined) ?? now);
  const customStart = parseDate(typeof query.startDate === "string" ? query.startDate : undefined);
  const startDate = startOfDay(range === "custom" && customStart ? customStart : subtractRange(endDate, range));
  const idleDays = clampNumber(Number(typeof query.idleDays === "string" ? query.idleDays : 30), 1, 3650);

  return { range, startDate, endDate, idleDays };
}

export async function buildReportDashboard(organizationId: string, filters: ReportFilters): Promise<ReportDashboard> {
  const dateWhere = { gte: filters.startDate, lte: filters.endDate };
  const bucket = getBucket(filters.startDate, filters.endDate);

  const [
    statusGroups,
    bookingGroups,
    allocationGroups,
    maintenanceRequests,
    mostUsedBookingGroups,
    mostUsedAllocationGroups,
    departments,
    categories,
    assets,
    approvals,
  ] = (await Promise.all([
    db.asset.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { _all: true },
    }),
    db.booking.groupBy({
      by: ["employeeId"],
      where: { organizationId, status: { in: [...BOOKING_USAGE_STATUSES] }, startTime: dateWhere },
      _count: { _all: true },
    }),
    db.allocation.groupBy({
      by: ["employeeId"],
      where: { organizationId, status: { in: [...ALLOCATION_USAGE_STATUSES] }, allocatedAt: dateWhere },
      _count: { _all: true },
    }),
    db.maintenanceRequest.findMany({
      where: { organizationId, openedAt: dateWhere },
      select: { openedAt: true, cost: true, status: true },
    }),
    db.booking.groupBy({
      by: ["assetId"],
      where: { organizationId, status: { in: [...BOOKING_USAGE_STATUSES] }, startTime: dateWhere },
      _count: { _all: true },
      orderBy: { _count: { assetId: "desc" } },
      take: 25,
    }),
    db.allocation.groupBy({
      by: ["assetId"],
      where: { organizationId, status: { in: [...ALLOCATION_USAGE_STATUSES] }, allocatedAt: dateWhere },
      _count: { _all: true },
      orderBy: { _count: { assetId: "desc" } },
      take: 25,
    }),
    db.department.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        _count: { select: { assets: true } },
        employees: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    db.assetCategory.findMany({
      where: { organizationId },
      select: { id: true, name: true, customAttributes: true, _count: { select: { assets: true } } },
      orderBy: { name: "asc" },
    }),
    db.asset.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        assetCode: true,
        status: true,
        departmentId: true,
        categoryId: true,
        purchaseDate: true,
        purchaseCost: true,
        currentValue: true,
        warrantyExpiry: true,
        createdAt: true,
        updatedAt: true,
        department: { select: { name: true } },
        category: { select: { name: true, customAttributes: true } },
        bookings: {
          where: { status: { in: [...BOOKING_USAGE_STATUSES] } },
          orderBy: { endTime: "desc" },
          take: 1,
          select: { endTime: true },
        },
        allocations: {
          where: { status: { in: [...ALLOCATION_USAGE_STATUSES] } },
          orderBy: { allocatedAt: "desc" },
          take: 1,
          select: { allocatedAt: true, returnedAt: true },
        },
        maintenanceRequests: {
          orderBy: { openedAt: "desc" },
          take: 1,
          select: { openedAt: true, status: true },
        },
      },
    }),
    db.approvalRequest.groupBy({
      by: ["status"],
      where: { organizationId, createdAt: dateWhere },
      _count: { _all: true },
    }),
  ])) as [
    Array<CountGroup<"status">>,
    Array<CountGroup<"employeeId">>,
    Array<CountGroup<"employeeId">>,
    MaintenanceRow[],
    Array<CountGroup<"assetId">>,
    Array<CountGroup<"assetId">>,
    DepartmentRow[],
    CategoryRow[],
    ReportAssetRow[],
    Array<CountGroup<"status">>,
  ];

  const employeeIds = unique([...bookingGroups.map((g) => g.employeeId), ...allocationGroups.map((g) => g.employeeId)]);
  const employees: EmployeeRow[] = employeeIds.length
    ? ((await db.employee.findMany({
        where: { organizationId, id: { in: employeeIds } },
        select: { id: true, departmentId: true, user: { select: { name: true } }, department: { select: { id: true, name: true } } },
      })) as EmployeeRow[])
    : [];
  const employeesById = new Map(employees.map((employee) => [employee.id, employee]));

  const usageByEmployee = new Map<string, number>();
  for (const group of bookingGroups) incrementMap(usageByEmployee, group.employeeId, group._count._all);
  for (const group of allocationGroups) incrementMap(usageByEmployee, group.employeeId, group._count._all);

  const departmentUsage = new Map<string, number>();
  for (const [employeeId, count] of usageByEmployee.entries()) {
    const departmentId = employeesById.get(employeeId)?.departmentId;
    if (departmentId) incrementMap(departmentUsage, departmentId, count);
  }

  const statusCounts = statusGroups.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count._all;
    return acc;
  }, {});
  const assetSummary = {
    totalAssets: assets.length,
    activeAssets: assets.filter((asset) => ACTIVE_ASSET_STATUSES.includes(asset.status as (typeof ACTIVE_ASSET_STATUSES)[number])).length,
    availableAssets: statusCounts.AVAILABLE ?? 0,
    allocatedAssets: statusCounts.ALLOCATED ?? 0,
    underMaintenanceAssets: statusCounts.UNDER_MAINTENANCE ?? 0,
    retiredAssets: (statusCounts.RETIRED ?? 0) + (statusCounts.DISPOSED ?? 0),
  };

  const utilizationByDepartment = departments.map((department) => {
    const usageCount = departmentUsage.get(department.id) ?? 0;
    const assetCount = department._count.assets;
    const denominator = Math.max(assetCount + department.employees.length, 1);
    return {
      name: department.name,
      value: Math.min(100, Math.round((usageCount / denominator) * 100)),
      bookingCount: department.employees.reduce((sum, employee) => sum + (bookingGroups.find((g) => g.employeeId === employee.id)?._count._all ?? 0), 0),
      allocationCount: department.employees.reduce((sum, employee) => sum + (allocationGroups.find((g) => g.employeeId === employee.id)?._count._all ?? 0), 0),
      assetCount,
    };
  });

  const usageByAsset = new Map<string, number>();
  for (const group of mostUsedBookingGroups) incrementMap(usageByAsset, group.assetId, group._count._all);
  for (const group of mostUsedAllocationGroups) incrementMap(usageByAsset, group.assetId, group._count._all);
  const mostUsedAssets = assets
    .map((asset) => ({ asset, usageCount: usageByAsset.get(asset.id) ?? 0 }))
    .filter((entry) => entry.usageCount > 0)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5)
    .map(({ asset, usageCount }) => ({
      assetId: asset.id,
      assetName: asset.name,
      assetCode: asset.assetCode,
      usageCount,
      department: asset.department?.name ?? "Unassigned",
    }));

  const idleCutoff = new Date(filters.endDate);
  idleCutoff.setDate(idleCutoff.getDate() - filters.idleDays);
  const idleAssets = assets
    .map((asset) => {
      const lastActivity = latestDate([
        asset.updatedAt,
        asset.bookings[0]?.endTime,
        asset.allocations[0]?.returnedAt,
        asset.allocations[0]?.allocatedAt,
        asset.maintenanceRequests[0]?.openedAt,
      ]);
      return { asset, lastActivity };
    })
    .filter(({ asset, lastActivity }) => asset.status !== "RETIRED" && asset.status !== "DISPOSED" && lastActivity < idleCutoff)
    .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
    .slice(0, 5)
    .map(({ asset, lastActivity }) => ({
      assetId: asset.id,
      assetName: asset.name,
      assetCode: asset.assetCode,
      idleDays: Math.max(0, differenceInDays(filters.endDate, lastActivity)),
      department: asset.department?.name ?? "Unassigned",
    }));

  const maintenanceDue = assets
    .flatMap((asset) => getMaintenanceDueItems(asset, filters.endDate))
    .slice(0, 8);

  const maintenanceFrequency = fillBuckets(maintenanceRequests, filters.startDate, filters.endDate, bucket, (request) => request.openedAt, (items, label) => ({
    label,
    value: items.length,
    cost: roundCurrency(items.reduce((sum, item) => sum + (item.cost ?? 0), 0)),
  }));

  const [bookingTrendRows, assetGrowthRows, allocationTrendRows, heatmapBookings] = (await Promise.all([
    db.booking.findMany({
      where: { organizationId, status: { in: [...BOOKING_USAGE_STATUSES] }, startTime: dateWhere },
      select: { startTime: true },
    }),
    db.asset.findMany({
      where: { organizationId, createdAt: dateWhere },
      select: { createdAt: true },
    }),
    db.allocation.findMany({
      where: { organizationId, status: { in: [...ALLOCATION_USAGE_STATUSES] }, allocatedAt: dateWhere },
      select: { allocatedAt: true },
    }),
    db.booking.findMany({
      where: { organizationId, status: { in: [...BOOKING_USAGE_STATUSES] }, startTime: dateWhere },
      select: { startTime: true },
    }),
  ])) as [
    Array<DateRow<"startTime">>,
    Array<DateRow<"createdAt">>,
    Array<DateRow<"allocatedAt">>,
    Array<DateRow<"startTime">>,
  ];

  return {
    generatedAt: new Date().toISOString(),
    filters: {
      range: filters.range,
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      idleDays: filters.idleDays,
    },
    assetSummary,
    utilizationByDepartment,
    maintenanceFrequency,
    mostUsedAssets,
    idleAssets,
    maintenanceDue,
    bookingTrends: fillBuckets(bookingTrendRows, filters.startDate, filters.endDate, bucket, (row) => row.startTime, (items, label) => ({ label, value: items.length })),
    assetGrowthOverTime: cumulativeBuckets(assetGrowthRows, filters.startDate, filters.endDate, bucket, (row) => row.createdAt),
    departmentAssetDistribution: departments.map((department) => ({ name: department.name, value: department._count.assets })),
    categoryAssetDistribution: categories.map((category) => ({ name: category.name, value: category._count.assets })),
    bookingHeatmap: buildBookingHeatmap(heatmapBookings.map((booking) => booking.startTime)),
    mostActiveEmployees: [...usageByEmployee.entries()]
      .map(([employeeId, usageCount]) => {
        const employee = employeesById.get(employeeId);
        return {
          employeeId,
          employeeName: employee?.user.name ?? "Unknown employee",
          department: employee?.department?.name ?? "Unassigned",
          usageCount,
        };
      })
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5),
    topDepartmentsByUsage: departments
      .map((department) => ({
        departmentId: department.id,
        departmentName: department.name,
        usageCount: departmentUsage.get(department.id) ?? 0,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5),
    maintenanceCostSummary: {
      totalCost: roundCurrency(maintenanceRequests.reduce((sum, request) => sum + (request.cost ?? 0), 0)),
      averageCost: roundCurrency(maintenanceRequests.length ? maintenanceRequests.reduce((sum, request) => sum + (request.cost ?? 0), 0) / maintenanceRequests.length : 0),
      requestCount: maintenanceRequests.length,
    },
    assetDepreciationSummary: buildDepreciationSummary(assets),
    approvalRequestStatistics: buildApprovalStats(approvals),
    assetAllocationTrends: fillBuckets(allocationTrendRows, filters.startDate, filters.endDate, bucket, (row) => row.allocatedAt, (items, label) => ({ label, value: items.length })),
  };
}

export async function buildUtilizationReport(organizationId: string, filters: ReportFilters) {
  return (await buildReportDashboard(organizationId, filters)).utilizationByDepartment;
}

export async function buildMaintenanceReport(organizationId: string, filters: ReportFilters) {
  const dashboard = await buildReportDashboard(organizationId, filters);
  return {
    frequency: dashboard.maintenanceFrequency,
    costSummary: dashboard.maintenanceCostSummary,
    due: dashboard.maintenanceDue,
  };
}

export async function buildAssetsReport(organizationId: string, filters: ReportFilters) {
  const dashboard = await buildReportDashboard(organizationId, filters);
  return {
    summary: dashboard.assetSummary,
    growth: dashboard.assetGrowthOverTime,
    departmentDistribution: dashboard.departmentAssetDistribution,
    categoryDistribution: dashboard.categoryAssetDistribution,
    mostUsed: dashboard.mostUsedAssets,
    idle: dashboard.idleAssets,
    depreciation: dashboard.assetDepreciationSummary,
  };
}

export async function buildBookingsReport(organizationId: string, filters: ReportFilters) {
  const dashboard = await buildReportDashboard(organizationId, filters);
  return {
    trends: dashboard.bookingTrends,
    heatmap: dashboard.bookingHeatmap,
    mostActiveEmployees: dashboard.mostActiveEmployees,
    topDepartmentsByUsage: dashboard.topDepartmentsByUsage,
    allocationTrends: dashboard.assetAllocationTrends,
  };
}

function normalizeRange(range?: string): ReportRangeKey {
  if (range === "last_7_days" || range === "last_30_days" || range === "last_90_days" || range === "last_6_months" || range === "last_year" || range === "custom") {
    return range;
  }
  return "last_30_days";
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function subtractRange(endDate: Date, range: ReportRangeKey): Date {
  const date = new Date(endDate);
  if (range === "last_7_days") date.setDate(date.getDate() - 6);
  else if (range === "last_90_days") date.setDate(date.getDate() - 89);
  else if (range === "last_6_months") date.setMonth(date.getMonth() - 5);
  else if (range === "last_year") date.setFullYear(date.getFullYear() - 1);
  else date.setDate(date.getDate() - 29);
  return date;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function incrementMap(map: Map<string, number>, key: string, amount: number) {
  map.set(key, (map.get(key) ?? 0) + amount);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function getBucket(startDate: Date, endDate: Date): "day" | "week" | "month" {
  const days = differenceInDays(endDate, startDate);
  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
}

function differenceInDays(a: Date, b: Date): number {
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);
}

function latestDate(dates: Array<Date | null | undefined>): Date {
  const timestamps = dates.filter((date): date is Date => Boolean(date)).map((date) => date.getTime());
  return new Date(Math.max(...timestamps));
}

function bucketKey(date: Date, bucket: "day" | "week" | "month"): string {
  if (bucket === "month") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (bucket === "week") {
    const weekStart = startOfDay(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return weekStart.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function bucketLabel(key: string, bucket: "day" | "week" | "month"): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  if (bucket === "month") return date.toLocaleString("en", { month: "short", year: "2-digit", timeZone: "UTC" });
  if (bucket === "week") return `Wk ${date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

function createBucketKeys(startDate: Date, endDate: Date, bucket: "day" | "week" | "month"): string[] {
  const keys: string[] = [];
  const cursor = startOfDay(startDate);
  while (cursor <= endDate) {
    const key = bucketKey(cursor, bucket);
    if (!keys.includes(key)) keys.push(key);
    if (bucket === "month") cursor.setMonth(cursor.getMonth() + 1);
    else if (bucket === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function fillBuckets<T, R>(
  rows: T[],
  startDate: Date,
  endDate: Date,
  bucket: "day" | "week" | "month",
  getDate: (row: T) => Date,
  build: (items: T[], label: string) => R
): R[] {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const key = bucketKey(getDate(row), bucket);
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }
  return createBucketKeys(startDate, endDate, bucket).map((key) => build(grouped.get(key) ?? [], bucketLabel(key, bucket)));
}

function cumulativeBuckets<T>(
  rows: T[],
  startDate: Date,
  endDate: Date,
  bucket: "day" | "week" | "month",
  getDate: (row: T) => Date
) {
  let running = 0;
  return fillBuckets(rows, startDate, endDate, bucket, getDate, (items, label) => {
    running += items.length;
    return { label, value: running };
  });
}

function buildBookingHeatmap(startTimes: Date[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = new Map<string, number>();
  for (const startTime of startTimes) {
    const key = `${days[startTime.getDay()]}-${startTime.getHours()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return days.flatMap((day) =>
    [0, 4, 8, 12, 16, 20].map((hour) => ({
      day,
      hour,
      value: counts.get(`${day}-${hour}`) ?? 0,
    }))
  );
}

function buildApprovalStats(groups: Array<{ status: string; _count: { _all: number } }>) {
  const stats = groups.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count._all;
    return acc;
  }, {});
  return {
    total: groups.reduce((sum, group) => sum + group._count._all, 0),
    pending: stats.PENDING ?? 0,
    approved: stats.APPROVED ?? 0,
    rejected: stats.REJECTED ?? 0,
  };
}

function buildDepreciationSummary(assets: Array<{ purchaseCost: number | null; currentValue: number | null }>) {
  const purchaseValue = roundCurrency(assets.reduce((sum, asset) => sum + (asset.purchaseCost ?? 0), 0));
  const currentValue = roundCurrency(assets.reduce((sum, asset) => sum + (asset.currentValue ?? asset.purchaseCost ?? 0), 0));
  const depreciationValue = roundCurrency(Math.max(0, purchaseValue - currentValue));
  return {
    purchaseValue,
    currentValue,
    depreciationValue,
    depreciationRate: purchaseValue > 0 ? Math.round((depreciationValue / purchaseValue) * 100) : 0,
  };
}

function getMaintenanceDueItems(asset: {
  id: string;
  name: string;
  assetCode: string;
  warrantyExpiry: Date | null;
  purchaseDate: Date | null;
  purchaseCost: number | null;
  currentValue: number | null;
  department: { name: string } | null;
  category: { customAttributes: unknown } | null;
  maintenanceRequests: Array<{ status: string; openedAt: Date }>;
}, endDate: Date) {
  const items: ReportDashboard["maintenanceDue"] = [];
  const next30 = new Date(endDate);
  next30.setDate(next30.getDate() + 30);
  const openMaintenance = asset.maintenanceRequests.find((request) => !["RESOLVED", "CLOSED", "REJECTED"].includes(request.status));
  if (openMaintenance) {
    items.push({
      assetId: asset.id,
      assetName: asset.name,
      assetCode: asset.assetCode,
      detail: `${openMaintenance.status.toLowerCase().replace(/_/g, " ")} maintenance request open`,
      department: asset.department?.name ?? "Unassigned",
      type: "MAINTENANCE",
    });
  } else if (asset.warrantyExpiry && asset.warrantyExpiry <= next30 && asset.warrantyExpiry >= endDate) {
    items.push({
      assetId: asset.id,
      assetName: asset.name,
      assetCode: asset.assetCode,
      detail: `warranty expires in ${differenceInDays(asset.warrantyExpiry, endDate)} days`,
      department: asset.department?.name ?? "Unassigned",
      type: "MAINTENANCE",
    });
  }

  const lifespan = getCategoryLifespan(asset.category?.customAttributes);
  if (asset.purchaseDate && lifespan) {
    const retirementDate = new Date(asset.purchaseDate);
    retirementDate.setFullYear(retirementDate.getFullYear() + lifespan);
    const daysToRetirement = differenceInDays(retirementDate, endDate);
    const depreciationRate = asset.purchaseCost && asset.currentValue != null ? 100 - Math.round((asset.currentValue / asset.purchaseCost) * 100) : 0;
    if (daysToRetirement <= 180 || depreciationRate >= 80) {
      items.push({
        assetId: asset.id,
        assetName: asset.name,
        assetCode: asset.assetCode,
        detail: daysToRetirement > 0 ? `retirement window in ${daysToRetirement} days` : `${depreciationRate}% depreciated`,
        department: asset.department?.name ?? "Unassigned",
        type: "RETIREMENT",
      });
    }
  }
  return items;
}

function getCategoryLifespan(customAttributes: unknown): number | null {
  if (!customAttributes || typeof customAttributes !== "object" || Array.isArray(customAttributes)) return null;
  const lifespan = (customAttributes as { lifespan?: unknown }).lifespan;
  return typeof lifespan === "number" && lifespan > 0 ? lifespan : null;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
