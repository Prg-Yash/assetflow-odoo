import { describe, it, expect, beforeEach, vi } from "vitest";
import { notificationService } from "../../src/services/notification/notification.service.js";
import {
  MockEmailProvider,
  MockSMSProvider,
  MockSlackProvider,
} from "../mocks/smtp.mock.js";
import { logger } from "../../src/logger/index.js";

describe("Notification Service Unit Tests", () => {
  let mockEmail: MockEmailProvider;
  let mockSMS: MockSMSProvider;
  let mockSlack: MockSlackProvider;

  beforeEach(() => {
    mockEmail = new MockEmailProvider();
    mockSMS = new MockSMSProvider();
    mockSlack = new MockSlackProvider();

    // Inject the mock providers into the private fields of NotificationService
    (notificationService as any).emailProvider = mockEmail;
    (notificationService as any).smsProvider = mockSMS;
    (notificationService as any).slackProvider = mockSlack;

    vi.spyOn(logger, "debug").mockImplementation(() => logger);
    vi.spyOn(logger, "warn").mockImplementation(() => logger);
    vi.spyOn(logger, "error").mockImplementation(() => logger);
  });

  it("should route email notifications to the designated EmailProvider", async () => {
    const emailOpts = {
      to: "test@domain.com",
      subject: "Test subject",
      template: "welcome",
      context: { name: "Bob" },
    };

    await notificationService.sendEmail(emailOpts);

    expect(mockEmail.sent.length).toBe(1);
    expect(mockEmail.sent[0]).toEqual(emailOpts);
    expect(mockSMS.sent.length).toBe(0);
    expect(mockSlack.sent.length).toBe(0);
  });

  it("should route SMS notifications to the designated SMSProvider", async () => {
    const smsOpts = {
      to: "+123456789",
      body: "Test SMS message body",
    };

    await notificationService.sendSMS(smsOpts);

    expect(mockSMS.sent.length).toBe(1);
    expect(mockSMS.sent[0]).toEqual(smsOpts);
    expect(mockEmail.sent.length).toBe(0);
    expect(mockSlack.sent.length).toBe(0);
  });

  it("should route Slack webhook notifications to the designated SlackProvider", async () => {
    const slackOpts = {
      channel: "#alerts",
      text: "System notification test message",
    };

    await notificationService.sendSlack(slackOpts);

    expect(mockSlack.sent.length).toBe(1);
    expect(mockSlack.sent[0]).toEqual(slackOpts);
    expect(mockEmail.sent.length).toBe(0);
    expect(mockSMS.sent.length).toBe(0);
  });

  it("should propagate errors from the underlying providers", async () => {
    const emailOpts = {
      to: "shindearyan179@gmail.com",
      subject: "Test subject",
      template: "welcome",
      context: {},
    };

    // Force mock email provider to throw an exception
    vi.spyOn(mockEmail, "send").mockRejectedValue(new Error("SMTP connection timeout"));

    await expect(notificationService.sendEmail(emailOpts)).rejects.toThrow("SMTP connection timeout");
  });
});
