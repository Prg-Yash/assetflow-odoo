/**
 * Centralized registry of all Job Names (sub-tasks) in the worker service.
 * Structured by queue domain to keep associations clear.
 */
export const JOBS = {
  NOTIFICATION: {
    SEND_EMAIL: "send-email",
    SEND_SMS: "send-sms",
    SEND_SLACK: "send-slack",
  },
  MAINTENANCE: {
    SCHEDULE_REMINDER: "schedule-reminder",
    CHECK_OVERDUE_RETURNS: "check-overdue-returns", // Repeatable cron
  },
  BOOKING: {
    SEND_REMINDER: "send-booking-reminder",
  },
  AUDIT: {
    CREATE_CYCLE: "create-cycle",
    GENERATE_REPORT: "generate-report",
  },
} as const;

// Helper type helper to get all jobs
export type JobName =
  | typeof JOBS.NOTIFICATION[keyof typeof JOBS.NOTIFICATION]
  | typeof JOBS.MAINTENANCE[keyof typeof JOBS.MAINTENANCE]
  | typeof JOBS.BOOKING[keyof typeof JOBS.BOOKING]
  | typeof JOBS.AUDIT[keyof typeof JOBS.AUDIT];
