import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cronRegistry } from "../../src/cron/registry.js";
import { QueueRegistry } from "../../src/queues/registry.js";
import { JOBS } from "../../src/constants/jobs.js";
import { env } from "../../src/config/environment.js";

describe("Cron Scheduler Spec", () => {
  beforeEach(async () => {
    // Cancel all repeatable jobs on start to ensure clean slate
    await cronRegistry.cancelAll();
  });

  afterEach(async () => {
    await cronRegistry.cancelAll();
  });

  it("should define standard cron jobs correctly in the registry", () => {
    const list = cronRegistry.getRegisteredCrons();
    expect(list.length).toBe(3);

    // Verify overdue return checker exists
    const overdueCheck = list.find((c) => c.jobName === JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS);
    expect(overdueCheck).toBeDefined();
    expect(overdueCheck?.cronExpression).toBe("0 * * * *"); // Hourly

    // Verify daily maintenance scheduler exists
    const dailyMaint = list.find((c) => c.jobName === JOBS.MAINTENANCE.SCHEDULE_REMINDER);
    expect(dailyMaint).toBeDefined();
    expect(dailyMaint?.cronExpression).toBe("0 8 * * *"); // 8:00 AM

    // Verify Slack status reporter exists
    const slackAudit = list.find((c) => c.jobName === JOBS.NOTIFICATION.SEND_SLACK);
    expect(slackAudit).toBeDefined();
    expect(slackAudit?.cronExpression).toBe("0 0 * * *"); // Midnight
  });

  it("should skip scheduling repeatable jobs if CRON_ENABLED is false", async () => {
    const originalCronEnabled = env.CRON_ENABLED;
    (env as any).CRON_ENABLED = false;

    // Spy on repeatable scheduler enqueues
    const spyMaint = vi.spyOn(QueueRegistry.maintenance, "addRepeatable");
    const spyNotif = vi.spyOn(QueueRegistry.notification, "addRepeatable");

    await cronRegistry.startAll();

    expect(spyMaint).not.toHaveBeenCalled();
    expect(spyNotif).not.toHaveBeenCalled();

    // Restore config
    (env as any).CRON_ENABLED = originalCronEnabled;
  });

  it("should successfully schedule repeatable cron jobs on Redis when CRON_ENABLED is true", async () => {
    const originalCronEnabled = env.CRON_ENABLED;
    (env as any).CRON_ENABLED = true;

    await cronRegistry.startAll();

    // Query BullMQ database to check scheduled repeatable items
    const maintCrons = await QueueRegistry.maintenance.getRawQueue().getRepeatableJobs();
    const notifCrons = await QueueRegistry.notification.getRawQueue().getRepeatableJobs();

    expect(maintCrons.length).toBe(2);
    expect(notifCrons.length).toBe(1);

    const checkOverdueRegistered = maintCrons.find(
      (c) => c.name === JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS
    );
    expect(checkOverdueRegistered).toBeDefined();
    expect(checkOverdueRegistered?.pattern).toBe("0 * * * *");

    const sendSlackRegistered = notifCrons.find(
      (c) => c.name === JOBS.NOTIFICATION.SEND_SLACK
    );
    expect(sendSlackRegistered).toBeDefined();
    expect(sendSlackRegistered?.pattern).toBe("0 0 * * *");

    (env as any).CRON_ENABLED = originalCronEnabled;
  });

  it("should cleanly cancel all cron jobs from Redis upon calling cancelAll()", async () => {
    const originalCronEnabled = env.CRON_ENABLED;
    (env as any).CRON_ENABLED = true;

    // Register them
    await cronRegistry.startAll();

    // Cancel them
    await cronRegistry.cancelAll();

    const maintCrons = await QueueRegistry.maintenance.getRawQueue().getRepeatableJobs();
    const notifCrons = await QueueRegistry.notification.getRawQueue().getRepeatableJobs();

    expect(maintCrons.length).toBe(0);
    expect(notifCrons.length).toBe(0);

    (env as any).CRON_ENABLED = originalCronEnabled;
  });
});
