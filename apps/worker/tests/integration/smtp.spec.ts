import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailProvider } from "../../src/services/notification/providers/email.provider.js";
import { AwsSesEmailProvider } from "../../src/services/notification/providers/ses.provider.js";
import { GmailEmailProvider } from "../../src/services/notification/providers/gmail.provider.js";
import { QueueRegistry } from "../../src/queues/registry.js";
import { env } from "../../src/config/environment.js";
import { logger } from "../../src/logger/index.js";
import { workerRegistry } from "../../src/processors/registry.js";
import { waitForJobState } from "../helpers/worker.helper.js";

describe("SMTP / Email Integration & Fallback Tests", () => {
  const testEmailRecipient = "shindearyan179@gmail.com";
  let hasSesConfigured = false;
  let hasGmailConfigured = false;

  beforeEach(() => {
    hasSesConfigured = !!(env.SES_SMTP_HOST && env.SES_SMTP_USER && env.SES_SMTP_PASS);
    hasGmailConfigured = !!(env.GMAIL_SMTP_USER && env.GMAIL_SMTP_PASS);
    vi.spyOn(logger, "info").mockImplementation(() => logger);
    vi.spyOn(logger, "warn").mockImplementation(() => logger);
    vi.spyOn(logger, "error").mockImplementation(() => logger);
    vi.spyOn(logger, "debug").mockImplementation(() => logger);
  });

  it("should verify SMTP connection options and environment settings", () => {
    expect(env.SMTP_FROM_EMAIL).toBeDefined();
    if (hasSesConfigured) {
      expect(env.SES_SMTP_HOST).toBeDefined();
      expect(env.SES_SMTP_PORT).toBeGreaterThan(0);
    }
    if (hasGmailConfigured) {
      expect(env.GMAIL_SMTP_HOST).toBe("smtp.gmail.com");
      expect(env.GMAIL_SMTP_PORT).toBe(587);
    }
  });

  it("should successfully queue an email job, process it, and verify completion", async () => {
    const job = await QueueRegistry.notification.sendEmail(
      testEmailRecipient,
      "Integration Test: Primary AWS SES Check",
      "test_email_verification",
      {
        userName: "Aryan Shinde",
        timeChecked: new Date().toISOString(),
      }
    );

    expect(job).toBeDefined();
    
    workerRegistry.startAll();

    const completedJob = await waitForJobState(QueueRegistry.notification.name, job.id!, "completed");
    expect(completedJob).toBeDefined();
    expect(completedJob.attemptsMade).toBe(0);

    await workerRegistry.closeAll();
  });

  it("should trigger Gmail fallback mode when primary AWS SES fails", async () => {
    // 1. Force AWS SES to fail by mocking its send method to throw an error
    const sesSpy = vi
      .spyOn(AwsSesEmailProvider.prototype, "send")
      .mockRejectedValue(new Error("AWS SES Rate Limit Exceeded"));
    
    // 2. Spy on Gmail provider to ensure it acts as the fallback
    const gmailSpy = vi
      .spyOn(GmailEmailProvider.prototype, "send")
      .mockResolvedValue();

    // 3. Enqueue the email job
    const job = await QueueRegistry.notification.sendEmail(
      testEmailRecipient,
      "Fallback Trigger Test",
      "test_fallback_alert",
      { alert: "AWS SES simulated fail" }
    );

    workerRegistry.startAll();

    const completedJob = await waitForJobState(QueueRegistry.notification.name, job.id!, "completed");
    expect(completedJob).toBeDefined();

    // 4. Verify the routing flow was triggered correctly
    expect(sesSpy).toHaveBeenCalled();
    expect(gmailSpy).toHaveBeenCalled();
    
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: "AWS SES Rate Limit Exceeded", to: testEmailRecipient }),
      expect.stringContaining("Activating Gmail SMTP fallback")
    );

    await workerRegistry.closeAll();
    sesSpy.mockRestore();
    gmailSpy.mockRestore();
  });

  it("should fail permanently when both primary SES and fallback Gmail fail", async () => {
    // Force both SES and Gmail to fail
    const sesSpy = vi
      .spyOn(AwsSesEmailProvider.prototype, "send")
      .mockRejectedValue(new Error("SES Outage"));
    
    const gmailSpy = vi
      .spyOn(GmailEmailProvider.prototype, "send")
      .mockRejectedValue(new Error("Gmail Authentication Failed"));

    const job = await QueueRegistry.notification.sendEmail(
      testEmailRecipient,
      "Fail-All Test",
      "test_fail_all",
      {}
    );

    workerRegistry.startAll();

    // The job should move to failed status
    const failedJob = await waitForJobState(QueueRegistry.notification.name, job.id!, "failed");
    expect(failedJob).toBeDefined();
    expect(failedJob.failedReason).toBe("Gmail Authentication Failed");

    expect(sesSpy).toHaveBeenCalled();
    expect(gmailSpy).toHaveBeenCalled();

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ to: testEmailRecipient }),
      expect.stringContaining("Email delivery has failed completely")
    );

    await workerRegistry.closeAll();
    sesSpy.mockRestore();
    gmailSpy.mockRestore();
  });
});
