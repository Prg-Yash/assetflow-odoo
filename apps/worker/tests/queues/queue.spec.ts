import { describe, it, expect } from "vitest";
import { QueueRegistry } from "../../src/queues/registry.js";
import { QUEUES } from "../../src/constants/queues.js";
import { JOBS } from "../../src/constants/jobs.js";
import { ENTERPRISE_FIXTURES } from "../fixtures/enterprise.fixtures.js";

describe("Queue Subsystem Tests", () => {
  it("should verify correct queue configuration and names", () => {
    expect(QueueRegistry.notification.name).toBe(QUEUES.NOTIFICATION);
    expect(QueueRegistry.maintenance.name).toBe(QUEUES.MAINTENANCE);
    expect(QueueRegistry.booking.name).toBe(QUEUES.BOOKING);
    expect(QueueRegistry.audit.name).toBe(QUEUES.AUDIT);
  });

  it("should successfully enqueue a job and verify payload integrity", async () => {
    const payload = {
      to: "bob.miller@company.com",
      subject: "Test Subject",
      template: "test_template",
      context: { key: "value" },
    };

    const job = await QueueRegistry.notification.sendEmail(
      payload.to,
      payload.subject,
      payload.template,
      payload.context
    );

    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
    expect(job.name).toBe(JOBS.NOTIFICATION.SEND_EMAIL);
    expect(job.queueName).toBe(QUEUES.NOTIFICATION);
    
    // Payload remains unchanged
    expect(job.data).toEqual({
      type: "email",
      data: payload,
    });
  });

  it("should schedule delayed jobs correctly", async () => {
    const payload = ENTERPRISE_FIXTURES.maintenance.compressorCheck;
    const delayMs = 5000;

    const job = await QueueRegistry.maintenance.scheduleReminder(
      payload.assetId,
      payload.id,
      payload.scheduledDate,
      payload.assignedToEmail,
      payload.title,
      { delay: delayMs }
    );

    expect(job).toBeDefined();
    expect(job.opts.delay).toBe(delayMs);
    
    const state = await job.getState();
    expect(state).toBe("delayed");
  });

  it("should support priority job insertion", async () => {
    const payload = ENTERPRISE_FIXTURES.booking.projectorBooking;

    const jobHigh = await QueueRegistry.booking.sendReminder(
      payload.id,
      payload.userId,
      payload.userEmail,
      payload.assetName,
      payload.startTime,
      { priority: 1 } // Lower number means higher priority in BullMQ
    );

    const jobNormal = await QueueRegistry.booking.sendReminder(
      payload.id,
      payload.userId,
      payload.userEmail,
      payload.assetName,
      payload.startTime,
      { priority: 10 }
    );

    expect(jobHigh.opts.priority).toBe(1);
    expect(jobNormal.opts.priority).toBe(10);
  });

  it("should handle bulk job insertion efficiently", async () => {
    const jobs = [
      {
        name: JOBS.NOTIFICATION.SEND_SMS,
        data: {
          type: "sms" as const,
          data: { to: "+1234567890", body: "Bulk SMS message 1" },
        },
      },
      {
        name: JOBS.NOTIFICATION.SEND_SMS,
        data: {
          type: "sms" as const,
          data: { to: "+0987654321", body: "Bulk SMS message 2" },
        },
      },
    ];

    const createdJobs = await QueueRegistry.notification.bulkAdd(jobs);
    expect(createdJobs.length).toBe(2);
    expect(createdJobs[0]?.name).toBe(JOBS.NOTIFICATION.SEND_SMS);
    expect(createdJobs[1]?.name).toBe(JOBS.NOTIFICATION.SEND_SMS);

    const counts = await QueueRegistry.notification.getJobCounts();
    expect(counts.wait).toBe(2);
  });

  it("should support unique job IDs and duplicate job prevention", async () => {
    const payload = ENTERPRISE_FIXTURES.booking.projectorBooking;
    const customJobId = "unique-booking-job-id-123";

    const job1 = await QueueRegistry.booking.sendReminder(
      payload.id,
      payload.userId,
      payload.userEmail,
      payload.assetName,
      payload.startTime,
      { jobId: customJobId }
    );

    // Add another job with the exact same jobId
    const job2 = await QueueRegistry.booking.sendReminder(
      payload.id,
      payload.userId,
      payload.userEmail,
      payload.assetName,
      payload.startTime,
      { jobId: customJobId }
    );

    expect(job1.id).toBe(customJobId);
    expect(job2.id).toBe(customJobId);

    const counts = await QueueRegistry.booking.getJobCounts();
    // BullMQ deduplicates: total waiting count should be 1
    expect(counts.wait).toBe(1);
  });

  it("should register repeatable cron jobs correctly", async () => {
    const cronPattern = "*/15 * * * *"; // Every 15 minutes
    const jobName = JOBS.MAINTENANCE.CHECK_OVERDUE_RETURNS;

    const job = await QueueRegistry.maintenance.addRepeatable(
      jobName,
      { checkThresholdDays: 5 },
      cronPattern
    );

    expect(job).toBeDefined();
    
    // Fetch all repeatable jobs from the queue to verify registration
    const repeatableJobs = await QueueRegistry.maintenance.getRawQueue().getRepeatableJobs();
    const registeredCron = repeatableJobs.find((r) => r.name === jobName && r.pattern === cronPattern);
    
    expect(registeredCron).toBeDefined();
    expect(registeredCron?.pattern).toBe(cronPattern);

    // Cancel repeatable job to clean up
    await QueueRegistry.maintenance.cancelRepeatable(jobName, cronPattern);
    const updatedJobs = await QueueRegistry.maintenance.getRawQueue().getRepeatableJobs();
    const deletedCron = updatedJobs.find((r) => r.name === jobName && r.pattern === cronPattern);
    expect(deletedCron).toBeUndefined();
  });

  it("should verify statistics update correctly", async () => {
    const initialStats = await QueueRegistry.notification.getJobCounts();
    expect(initialStats.wait).toBe(0);

    await QueueRegistry.notification.sendSlack("Testing statistics updates");
    const updatedStats = await QueueRegistry.notification.getJobCounts();
    expect(updatedStats.wait).toBe(1);
  });
});
