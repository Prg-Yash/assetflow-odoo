import { describe, it, expect, vi, beforeEach } from "vitest";
import { Job } from "bullmq";
import { NotificationProcessor } from "../../src/processors/notification.processor.js";
import { MaintenanceProcessor } from "../../src/processors/maintenance.processor.js";
import { BookingProcessor } from "../../src/processors/booking.processor.js";
import { AuditProcessor } from "../../src/processors/audit.processor.js";
import { notificationService } from "../../src/services/notification/notification.service.js";
import { QueueRegistry } from "../../src/queues/registry.js";
import { JOBS } from "../../src/constants/jobs.js";
import { QUEUES } from "../../src/constants/queues.js";
import { ENTERPRISE_FIXTURES } from "../fixtures/enterprise.fixtures.js";
import { logger } from "../../src/logger/index.js";

// Helper to construct a mock BullMQ Job instance
function createMockJob(name: string, data: any, queueName: string): Job {
  return {
    id: "job-id-123",
    name,
    data,
    queueName,
    attemptsMade: 0,
    opts: {},
    updateProgress: vi.fn(),
    log: vi.fn(),
  } as unknown as Job;
}

describe("Processor Unit Tests", () => {
  beforeEach(() => {
    vi.spyOn(logger, "info").mockImplementation(() => logger);
    vi.spyOn(logger, "error").mockImplementation(() => logger);
    vi.spyOn(logger, "warn").mockImplementation(() => logger);
    vi.spyOn(logger, "debug").mockImplementation(() => logger);
  });

  describe("NotificationProcessor", () => {
    it("should process and route email jobs to notificationService", async () => {
      const emailData = {
        to: "alice@company.com",
        subject: "Hello",
        template: "welcome",
        context: {},
      };
      const job = createMockJob(
        JOBS.NOTIFICATION.SEND_EMAIL,
        { type: "email", data: emailData },
        QUEUES.NOTIFICATION
      );

      const spy = vi.spyOn(notificationService, "sendEmail").mockResolvedValue();
      const processor = new NotificationProcessor();
      
      await processor.process(job);

      expect(spy).toHaveBeenCalledWith(emailData);
    });

    it("should process and route SMS jobs to notificationService", async () => {
      const smsData = { to: "+123456", body: "Hello SMS" };
      const job = createMockJob(
        JOBS.NOTIFICATION.SEND_SMS,
        { type: "sms", data: smsData },
        QUEUES.NOTIFICATION
      );

      const spy = vi.spyOn(notificationService, "sendSMS").mockResolvedValue();
      const processor = new NotificationProcessor();

      await processor.process(job);

      expect(spy).toHaveBeenCalledWith(smsData);
    });

    it("should fail and throw error for mismatched payload type", async () => {
      const job = createMockJob(
        JOBS.NOTIFICATION.SEND_EMAIL,
        { type: "sms", data: {} }, // Mismatched type
        QUEUES.NOTIFICATION
      );

      const processor = new NotificationProcessor();

      await expect(processor.process(job)).rejects.toThrow();
    });
  });

  describe("MaintenanceProcessor", () => {
    it("should process schedule-reminder jobs and enqueue notification email", async () => {
      const ticket = ENTERPRISE_FIXTURES.maintenance.compressorCheck;
      const job = createMockJob(
        JOBS.MAINTENANCE.SCHEDULE_REMINDER,
        {
          assetId: ticket.assetId,
          maintenanceId: ticket.id,
          scheduledDate: ticket.scheduledDate,
          assignedToEmail: ticket.assignedToEmail,
          title: ticket.title,
        },
        QUEUES.MAINTENANCE
      );

      const spy = vi.spyOn(QueueRegistry.notification, "sendEmail").mockResolvedValue({} as any);
      const processor = new MaintenanceProcessor();

      await processor.process(job);

      expect(spy).toHaveBeenCalledWith(
        ticket.assignedToEmail,
        `Reminder: ${ticket.title}`,
        "maintenance_reminder_template",
        {
          assetId: ticket.assetId,
          maintenanceId: ticket.id,
          dueDate: ticket.scheduledDate,
        }
      );
    });

    it("should process check-overdue-returns and enqueue notification jobs in bulk", async () => {
      const job = createMockJob(
        JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS,
        { checkThresholdDays: 7 },
        QUEUES.MAINTENANCE
      );

      const spy = vi.spyOn(QueueRegistry.notification, "bulkAdd").mockResolvedValue([] as any);
      const processor = new MaintenanceProcessor();

      await processor.process(job);

      expect(spy).toHaveBeenCalled();
      const enqueuedJobs = spy.mock.calls[0]?.[0];
      expect(enqueuedJobs).toBeDefined();
      expect(enqueuedJobs?.length).toBeGreaterThan(0);
      expect(enqueuedJobs?.[0]?.name).toBe(JOBS.NOTIFICATION.SEND_EMAIL);
    });
  });

  describe("BookingProcessor", () => {
    it("should process booking reminders and trigger emails and Slack notifications", async () => {
      const booking = ENTERPRISE_FIXTURES.booking.projectorBooking;
      const job = createMockJob(
        JOBS.BOOKING.SEND_REMINDER,
        {
          bookingId: booking.id,
          userId: booking.userId,
          userEmail: booking.userEmail,
          assetName: booking.assetName,
          startTime: booking.startTime,
        },
        QUEUES.BOOKING
      );

      const emailSpy = vi.spyOn(QueueRegistry.notification, "sendEmail").mockResolvedValue({} as any);
      const slackSpy = vi.spyOn(QueueRegistry.notification, "sendSlack").mockResolvedValue({} as any);

      const processor = new BookingProcessor();
      await processor.process(job);

      expect(emailSpy).toHaveBeenCalledWith(
        booking.userEmail,
        expect.stringContaining(booking.assetName),
        "booking_reminder",
        {
          bookingId: booking.id,
          assetName: booking.assetName,
          startTime: booking.startTime,
        }
      );
      expect(slackSpy).toHaveBeenCalledWith(expect.stringContaining(booking.assetName));
    });
  });

  describe("AuditProcessor", () => {
    it("should process create-cycle and trigger Slack audit logs", async () => {
      const audit = ENTERPRISE_FIXTURES.audit.hardwareAudit;
      const job = createMockJob(
        JOBS.AUDIT.CREATE_CYCLE,
        {
          auditId: audit.id,
          departmentId: audit.departmentId,
          creatorId: audit.creatorId,
          scope: audit.scope,
        },
        QUEUES.AUDIT
      );

      const slackSpy = vi.spyOn(QueueRegistry.notification, "sendSlack").mockResolvedValue({} as any);
      const processor = new AuditProcessor();

      await processor.process(job);

      expect(slackSpy).toHaveBeenCalledWith(expect.stringContaining(audit.id));
    });

    it("should process generate-report, simulate compilation, and dispatch email download links", async () => {
      const job = createMockJob(
        JOBS.AUDIT.GENERATE_REPORT,
        {
          auditId: "audit-q3",
          format: "PDF",
          recipientEmail: "admin@company.com",
        },
        QUEUES.AUDIT
      );

      const emailSpy = vi.spyOn(QueueRegistry.notification, "sendEmail").mockResolvedValue({} as any);
      const processor = new AuditProcessor();

      // Temporarily mock setTimeout inside the test to run instantly rather than waiting 5 seconds
      vi.useFakeTimers();
      const processPromise = processor.process(job);
      vi.advanceTimersByTime(5000);
      await processPromise;
      vi.useRealTimers();

      expect(emailSpy).toHaveBeenCalledWith(
        "admin@company.com",
        "Your Audit Report is Ready!",
        "audit_report_ready",
        expect.objectContaining({
          auditId: "audit-q3",
          format: "PDF",
          downloadUrl: expect.stringContaining("reports/audit-audit-q3.pdf"),
        })
      );
    });
  });

  describe("BaseProcessor Error Handling", () => {
    it("should handle exceptions and re-throw them without crashing the logging flow", async () => {
      const job = createMockJob(
        JOBS.NOTIFICATION.SEND_EMAIL,
        { type: "email", data: {} },
        QUEUES.NOTIFICATION
      );

      // Force email provider failure
      vi.spyOn(notificationService, "sendEmail").mockRejectedValue(new Error("SMTP Outage"));
      const processor = new NotificationProcessor();

      await expect(processor.process(job)).rejects.toThrow("SMTP Outage");
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw an error for unknown/unregistered job names", async () => {
      const job = createMockJob("invalid-job-name", {}, QUEUES.NOTIFICATION);
      const processor = new NotificationProcessor();

      await expect(processor.process(job)).rejects.toThrow("No registered handler found");
    });
  });
});
