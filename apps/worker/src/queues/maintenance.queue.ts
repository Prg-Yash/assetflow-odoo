import { BaseQueue } from "./base.queue.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import {
  ScheduleMaintenanceReminderPayload,
  OverdueAssetCheckPayload,
} from "../types/job.types.js";
import { JobsOptions } from "bullmq";

/**
 * Queue service for managing asset maintenance reminders and scheduled cron operations.
 */
export class MaintenanceQueue extends BaseQueue<
  ScheduleMaintenanceReminderPayload | OverdueAssetCheckPayload
> {
  constructor() {
    super(QUEUES.MAINTENANCE);
  }

  /**
   * Enqueue a maintenance reminder alert
   */
  public async scheduleReminder(
    assetId: string,
    maintenanceId: string,
    scheduledDate: string,
    assignedToEmail: string,
    title: string,
    opts?: JobsOptions
  ) {
    const payload: ScheduleMaintenanceReminderPayload = {
      assetId,
      maintenanceId,
      scheduledDate,
      assignedToEmail,
      title,
    };
    return this.addJob(JOBS.MAINTENANCE.SCHEDULE_REMINDER, payload, opts);
  }

  /**
   * Register or run the overdue asset check cron.
   * Can be executed manually or set up as a repeatable job.
   */
  public async scheduleOverdueCheck(
    checkThresholdDays: number = 7,
    opts?: JobsOptions
  ) {
    const payload: OverdueAssetCheckPayload = { checkThresholdDays };
    return this.addJob(JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS, payload, opts);
  }
}
