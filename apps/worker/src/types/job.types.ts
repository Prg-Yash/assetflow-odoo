/**
 * Strongly typed payload definitions for the background worker jobs.
 */

// ==========================================
// Notification Queue Payloads
// ==========================================

export interface SendEmailPayload {
  to: string;
  subject: string;
  template: string;
  context: Record<string, string | number | boolean>;
}

export interface SendSMSPayload {
  to: string;
  body: string;
}

export interface SendSlackPayload {
  channel?: string;
  text: string;
}

// Union of all possible notification payloads
export type NotificationJobPayload =
  | { type: "email"; data: SendEmailPayload }
  | { type: "sms"; data: SendSMSPayload }
  | { type: "slack"; data: SendSlackPayload };


// ==========================================
// Maintenance Queue Payloads
// ==========================================

export interface ScheduleMaintenanceReminderPayload {
  assetId: string;
  maintenanceId: string;
  scheduledDate: string;
  assignedToEmail: string;
  title: string;
}

export interface OverdueAssetCheckPayload {
  // Empty because it's a cron job querying DB for overdue assets
  checkThresholdDays?: number;
}

// ==========================================
// Booking Queue Payloads
// ==========================================

export interface SendBookingReminderPayload {
  bookingId: string;
  userId: string;
  userEmail: string;
  assetName: string;
  startTime: string;
}


// ==========================================
// Audit Queue Payloads
// ==========================================

export interface CreateAuditCyclePayload {
  auditId: string;
  departmentId: string;
  creatorId: string;
  scope: string[];
}

export interface GenerateAuditReportPayload {
  auditId: string;
  format: "PDF" | "CSV" | "JSON";
  recipientEmail: string;
}
