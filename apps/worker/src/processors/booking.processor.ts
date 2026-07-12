import { Job } from "bullmq";
import { BaseProcessor } from "./base.processor.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import { logger } from "../logger/index.js";
import { QueueRegistry } from "../queues/registry.js";
import { SendBookingReminderPayload } from "../types/job.types.js";

/**
 * Processor handling resource booking life-cycle events.
 */
export class BookingProcessor extends BaseProcessor {
  public readonly queueName = QUEUES.BOOKING;

  protected handlers = {
    [JOBS.BOOKING.SEND_REMINDER]: this.handleSendReminder,
  };

  /**
   * Processes the dispatch of booking reminders
   */
  private async handleSendReminder(
    job: Job<SendBookingReminderPayload>
  ): Promise<void> {
    const payload = job.data;
    logger.info(
      { bookingId: payload.bookingId, userId: payload.userId },
      `Processing booking reminder for booking ${payload.bookingId}`
    );

    // Enqueue an email notification
    await QueueRegistry.notification.sendEmail(
      payload.userEmail,
      `Reminder: Your booking for ${payload.assetName} starts soon!`,
      "booking_reminder",
      {
        bookingId: payload.bookingId,
        assetName: payload.assetName,
        startTime: payload.startTime,
      }
    );

    // Enqueue a slack alert for confirmation
    await QueueRegistry.notification.sendSlack(
      `Booking reminder sent to user for asset: ${payload.assetName} starting at ${payload.startTime}`
    );
  }
}
export default BookingProcessor;
