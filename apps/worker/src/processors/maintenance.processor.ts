import { Job } from "bullmq";
import { BaseProcessor } from "./base.processor.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import { logger } from "../logger/index.js";
import { QueueRegistry } from "../queues/registry.js";
import { db } from "@repo/db";
import {
  ScheduleMaintenanceReminderPayload,
  OverdueAssetCheckPayload,
} from "../types/job.types.js";

/**
 * Processor responsible for managing maintenance operations.
 */
export class MaintenanceProcessor extends BaseProcessor {
  public readonly queueName = QUEUES.MAINTENANCE;

  protected handlers = {
    [JOBS.MAINTENANCE.SCHEDULE_REMINDER]: this.handleScheduleReminder,
    [JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS]: this.handleCheckOverdueReturns,
  };

  /**
   * Processes individual scheduled maintenance reminders
   */
  private async handleScheduleReminder(
    job: Job<ScheduleMaintenanceReminderPayload>
  ): Promise<void> {
    const payload = job.data;
    logger.info(
      { assetId: payload.assetId, maintenanceId: payload.maintenanceId, date: payload.scheduledDate },
      `Processing maintenance reminder for asset ${payload.assetId}`
    );

    // 1. In a production scenario, check if the maintenance ticket is still open in the DB
    try {
      // Example DB lookup:
      // const ticket = await db.maintenance.findUnique({ where: { id: payload.maintenanceId } });
      // if (ticket?.status === 'COMPLETED') return;
    } catch (dbError) {
      logger.warn({ err: dbError }, "DB check skipped for maintenance status verification");
    }

    // 2. Dispatch email reminder using the NotificationQueue
    await QueueRegistry.notification.sendEmail(
      payload.assignedToEmail,
      `Reminder: ${payload.title}`,
      "maintenance_reminder_template",
      {
        assetId: payload.assetId,
        maintenanceId: payload.maintenanceId,
        dueDate: payload.scheduledDate,
      }
    );
  }

  /**
   * Hourly cron job checking for overdue asset checkouts.
   * Demonstrates job chaining / fan-out patterns.
   */
  private async handleCheckOverdueReturns(
    job: Job<OverdueAssetCheckPayload>
  ): Promise<void> {
    const thresholdDays = job.data?.checkThresholdDays ?? 7;
    logger.info(
      { thresholdDays },
      "Running hourly audit of overdue asset checkouts..."
    );

    try {
      // In a real application, perform a DB query:
      // const overdueCheckouts = await db.assetCheckout.findMany({
      //   where: {
      //     returnedAt: null,
      //     dueDate: { lt: new Date() }
      //   },
      //   include: { user: true, asset: true }
      // });
      
      // Mocking query results for demonstrating the pattern:
      const mockOverdueCheckouts = [
        {
          id: "chk-102",
          userEmail: "worker1@company.com",
          userName: "Alice Smith",
          assetName: "MacBook Pro M3",
          dueDate: new Date().toISOString(),
        },
      ];

      logger.info(
        { overdueCount: mockOverdueCheckouts.length },
        `Found overdue asset returns. Dispatching notification jobs.`
      );

      // Enqueue notification jobs in bulk for all overdue returns
      const notificationJobs = mockOverdueCheckouts.map((checkout) => ({
        name: JOBS.NOTIFICATION.SEND_EMAIL,
        data: {
          type: "email" as const,
          data: {
            to: checkout.userEmail,
            subject: `Action Required: Return Overdue for ${checkout.assetName}`,
            template: "overdue_return_alert",
            context: {
              userName: checkout.userName,
              assetName: checkout.assetName,
              dueDate: checkout.dueDate,
            },
          },
        },
      }));

      if (notificationJobs.length > 0) {
        await QueueRegistry.notification.bulkAdd(notificationJobs);
      }
    } catch (dbError) {
      logger.error({ err: dbError }, "Failed to query overdue checkouts from DB");
      throw dbError;
    }
  }
}
export default MaintenanceProcessor;
