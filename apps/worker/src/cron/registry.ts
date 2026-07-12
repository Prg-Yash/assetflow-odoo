import { env } from "../config/environment.js";
import { logger } from "../logger/index.js";
import { QueueRegistry } from "../queues/registry.js";
import { JOBS } from "../constants/jobs.js";

/**
 * Interface representing a Repeatable Cron Job configuration
 */
interface CronJobDefinition {
  queue: {
    addRepeatable: (
      jobName: string,
      data: any,
      cronPattern: string,
      opts?: any
    ) => Promise<any>;
    cancelRepeatable: (jobName: string, cronPattern: string) => Promise<void>;
  };
  jobName: string;
  payload: any;
  cronExpression: string;
  description: string;
}

/**
 * Registry managing the definition, startup, and cancellation of repeatable cron tasks.
 */
class CronRegistry {
  private jobs: CronJobDefinition[] = [];

  constructor() {
    this.jobs = [
      {
        queue: QueueRegistry.maintenance,
        jobName: JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS,
        payload: { checkThresholdDays: 7 },
        cronExpression: "0 * * * *", // Runs hourly on the hour (e.g., 1:00, 2:00)
        description: "Checking overdue asset returns hourly",
      },
      {
        queue: QueueRegistry.maintenance,
        jobName: JOBS.MAINTENANCE.SCHEDULE_REMINDER,
        // Daily maintenance check for tickets due today
        payload: { autoTriggerToday: true },
        cronExpression: "0 8 * * *", // Runs daily at 8:00 AM
        description: "Dispatching pending maintenance reminders daily",
      },
      {
        queue: QueueRegistry.notification,
        jobName: JOBS.NOTIFICATION.SEND_SLACK,
        payload: { text: "System Health Audit: Asynchronous Worker active and healthy." },
        cronExpression: "0 0 * * *", // Runs daily at midnight
        description: "Sending daily system health status alert via Slack webhook",
      },
    ];
  }

  /**
   * Initializes and schedules all repeatable jobs if cron mode is enabled.
   */
  public async startAll(): Promise<void> {
    if (!env.CRON_ENABLED) {
      logger.info(
        "CronRegistry: CRON_ENABLED is set to false. Skipping repeatable job registration."
      );
      return;
    }

    logger.info("CronRegistry: Scheduling repeatable background jobs...");

    for (const def of this.jobs) {
      try {
        await def.queue.addRepeatable(def.jobName, def.payload, def.cronExpression);
        logger.info(
          { jobName: def.jobName, cron: def.cronExpression },
          `CronRegistry: Scheduled: "${def.description}"`
        );
      } catch (error) {
        logger.error(
          { err: error, jobName: def.jobName },
          `CronRegistry: Failed to schedule repeatable job`
        );
      }
    }
  }

  /**
   * De-registers/removes all repeatable jobs from Redis (useful during teardowns or config updates)
   */
  public async cancelAll(): Promise<void> {
    logger.info("CronRegistry: Cancelling all repeatable cron jobs...");
    for (const def of this.jobs) {
      try {
        await def.queue.cancelRepeatable(def.jobName, def.cronExpression);
        logger.info(
          { jobName: def.jobName, cron: def.cronExpression },
          `CronRegistry: Cancelled repeatable job successfully`
        );
      } catch (error) {
        logger.error(
          { err: error, jobName: def.jobName },
          `CronRegistry: Failed to cancel repeatable job`
        );
      }
    }
  }

  /**
   * Returns active cron lists for status checking
   */
  public getRegisteredCrons() {
    return this.jobs.map((j) => ({
      description: j.description,
      jobName: j.jobName,
      cronExpression: j.cronExpression,
    }));
  }
}

export const cronRegistry = new CronRegistry();
export default cronRegistry;
