import { BaseQueue } from "./base.queue.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import { SendBookingReminderPayload } from "../types/job.types.js";
import { JobsOptions } from "bullmq";

/**
 * Queue service for resource scheduling and booking flow actions.
 */
export class BookingQueue extends BaseQueue<SendBookingReminderPayload> {
  constructor() {
    super(QUEUES.BOOKING);
  }

  /**
   * Enqueue a booking reminder to be dispatched at a specific future timestamp
   * (e.g., 30 minutes before booking start).
   */
  public async sendReminder(
    bookingId: string,
    userId: string,
    userEmail: string,
    assetName: string,
    startTime: string,
    opts?: JobsOptions
  ) {
    const payload: SendBookingReminderPayload = {
      bookingId,
      userId,
      userEmail,
      assetName,
      startTime,
    };
    return this.addJob(JOBS.BOOKING.SEND_REMINDER, payload, opts);
  }
}
