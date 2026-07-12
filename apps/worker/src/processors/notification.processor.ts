import { Job } from "bullmq";
import { BaseProcessor } from "./base.processor.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import { notificationService } from "../services/notification/notification.service.js";
import { NotificationJobPayload } from "../types/job.types.js";

/**
 * Processor responsible for dispatching multi-channel notifications.
 * Each job type resolves to its specific sub-handler, avoiding switch statement bloat.
 */
export class NotificationProcessor extends BaseProcessor {
  public readonly queueName = QUEUES.NOTIFICATION;

  protected handlers = {
    [JOBS.NOTIFICATION.SEND_EMAIL]: this.handleSendEmail,
    [JOBS.NOTIFICATION.SEND_SMS]: this.handleSendSMS,
    [JOBS.NOTIFICATION.SEND_SLACK]: this.handleSendSlack,
  };

  /**
   * Handler for sending transactional emails
   */
  private async handleSendEmail(job: Job<NotificationJobPayload>): Promise<void> {
    const payload = job.data;
    if (payload.type !== "email") {
      throw new Error(`Invalid payload type "${payload.type}" for send-email job`);
    }
    await notificationService.sendEmail(payload.data);
  }

  /**
   * Handler for sending SMS alerts
   */
  private async handleSendSMS(job: Job<NotificationJobPayload>): Promise<void> {
    const payload = job.data;
    if (payload.type !== "sms") {
      throw new Error(`Invalid payload type "${payload.type}" for send-sms job`);
    }
    await notificationService.sendSMS(payload.data);
  }

  /**
   * Handler for sending Slack notifications
   */
  private async handleSendSlack(job: Job<NotificationJobPayload>): Promise<void> {
    const payload = job.data;
    if (payload.type !== "slack") {
      throw new Error(`Invalid payload type "${payload.type}" for send-slack job`);
    }
    await notificationService.sendSlack(payload.data);
  }
}
export default NotificationProcessor;
