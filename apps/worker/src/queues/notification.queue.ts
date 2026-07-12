import { BaseQueue } from "./base.queue.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import {
  NotificationJobPayload,
  SendEmailPayload,
  SendSMSPayload,
  SendSlackPayload,
} from "../types/job.types.js";
import { JobsOptions } from "bullmq";

/**
 * Queue service for managing notifications.
 * Exposes clean, semantic wrapper methods for sending Emails, SMS, and Slack messages.
 */
export class NotificationQueue extends BaseQueue<NotificationJobPayload> {
  constructor() {
    super(QUEUES.NOTIFICATION);
  }

  /**
   * Enqueue an email job
   */
  public async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, string | number | boolean>,
    opts?: JobsOptions
  ) {
    const payload: SendEmailPayload = { to, subject, template, context };
    return this.addJob(
      JOBS.NOTIFICATION.SEND_EMAIL,
      { type: "email", data: payload },
      opts
    );
  }

  /**
   * Enqueue an SMS job
   */
  public async sendSMS(to: string, body: string, opts?: JobsOptions) {
    const payload: SendSMSPayload = { to, body };
    return this.addJob(
      JOBS.NOTIFICATION.SEND_SMS,
      { type: "sms", data: payload },
      opts
    );
  }

  /**
   * Enqueue a Slack webhook notification job
   */
  public async sendSlack(text: string, channel?: string, opts?: JobsOptions) {
    const payload: SendSlackPayload = { text, channel };
    return this.addJob(
      JOBS.NOTIFICATION.SEND_SLACK,
      { type: "slack", data: payload },
      opts
    );
  }
}
