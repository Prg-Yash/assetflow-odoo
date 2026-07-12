import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
  buildAssetsReport,
  buildBookingsReport,
  buildMaintenanceReport,
  buildReportDashboard,
  buildUtilizationReport,
  parseReportFilters,
} from "../services/reports.service.js";

export const getReportsDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await buildReportDashboard(req.organizationId!, parseReportFilters(req.query));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getReportsUtilization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await buildUtilizationReport(req.organizationId!, parseReportFilters(req.query));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getReportsMaintenance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await buildMaintenanceReport(req.organizationId!, parseReportFilters(req.query));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getReportsAssets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await buildAssetsReport(req.organizationId!, parseReportFilters(req.query));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getReportsBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await buildBookingsReport(req.organizationId!, parseReportFilters(req.query));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const exportReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const format = typeof req.query.format === "string" ? req.query.format.toLowerCase() : "csv";
    const dashboard = await buildReportDashboard(req.organizationId!, parseReportFilters(req.query));
    const baseName = `assetflow-report-${dashboard.filters.startDate.slice(0, 10)}-${dashboard.filters.endDate.slice(0, 10)}`;

    if (format === "pdf") {
      const pdf = createSimplePdf(renderReportText(dashboard));
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}.pdf"`);
      res.status(200).send(pdf);
      return;
    }

    const csv = renderReportCsv(dashboard);
    if (format === "excel" || format === "xlsx" || format === "xls") {
      res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}.xls"`);
      res.status(200).send(csv);
      return;
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${baseName}.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

type DashboardExport = Awaited<ReturnType<typeof buildReportDashboard>>;

function renderReportCsv(report: DashboardExport): string {
  const rows: string[][] = [
    ["Metric", "Value"],
    ["Generated At", report.generatedAt],
    ["Start Date", report.filters.startDate],
    ["End Date", report.filters.endDate],
    ["Total Assets", String(report.assetSummary.totalAssets)],
    ["Active Assets", String(report.assetSummary.activeAssets)],
    ["Available Assets", String(report.assetSummary.availableAssets)],
    ["Allocated Assets", String(report.assetSummary.allocatedAssets)],
    ["Under Maintenance Assets", String(report.assetSummary.underMaintenanceAssets)],
    ["Retired Assets", String(report.assetSummary.retiredAssets)],
    ["Maintenance Cost", String(report.maintenanceCostSummary.totalCost)],
    ["Depreciation Value", String(report.assetDepreciationSummary.depreciationValue)],
    [],
    ["Utilization by Department"],
    ["Department", "Utilization %", "Bookings", "Allocations", "Assets"],
    ...report.utilizationByDepartment.map((row) => [row.name, String(row.value), String(row.bookingCount), String(row.allocationCount), String(row.assetCount)]),
    [],
    ["Most Used Assets"],
    ["Asset Code", "Asset Name", "Department", "Usage Count"],
    ...report.mostUsedAssets.map((row) => [row.assetCode, row.assetName, row.department, String(row.usageCount)]),
    [],
    ["Idle Assets"],
    ["Asset Code", "Asset Name", "Department", "Idle Days"],
    ...report.idleAssets.map((row) => [row.assetCode, row.assetName, row.department, String(row.idleDays)]),
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function renderReportText(report: DashboardExport): string[] {
  return [
    "AssetFlow Reports & Analytics",
    `Generated: ${report.generatedAt}`,
    `Period: ${report.filters.startDate.slice(0, 10)} to ${report.filters.endDate.slice(0, 10)}`,
    `Total Assets: ${report.assetSummary.totalAssets}`,
    `Active Assets: ${report.assetSummary.activeAssets}`,
    `Available Assets: ${report.assetSummary.availableAssets}`,
    `Allocated Assets: ${report.assetSummary.allocatedAssets}`,
    `Under Maintenance: ${report.assetSummary.underMaintenanceAssets}`,
    `Retired Assets: ${report.assetSummary.retiredAssets}`,
    `Maintenance Cost: ${report.maintenanceCostSummary.totalCost}`,
    `Depreciation: ${report.assetDepreciationSummary.depreciationValue}`,
    "Most Used Assets:",
    ...report.mostUsedAssets.map((asset) => `${asset.assetCode} ${asset.assetName} - ${asset.usageCount} uses`),
    "Idle Assets:",
    ...report.idleAssets.map((asset) => `${asset.assetCode} ${asset.assetName} - ${asset.idleDays} idle days`),
  ];
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function createSimplePdf(lines: string[]): Buffer {
  const escapedLines = lines.slice(0, 42).map((line) => line.replace(/[()\\]/g, "\\$&"));
  const text = escapedLines.map((line, index) => `BT /F1 11 Tf 48 ${780 - index * 16} Td (${line}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
  ];
  const parts = ["%PDF-1.4\n"];
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(parts.join("")));
    parts.push(`${i + 1} 0 obj\n${objects[i]}\nendobj\n`);
  }
  const xrefOffset = Buffer.byteLength(parts.join(""));
  parts.push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => parts.push(`${String(offset).padStart(10, "0")} 00000 n \n`));
  parts.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return Buffer.from(parts.join(""));
}
