/**
 * Centralized registry of all Queue Names in the system.
 * Using a readonly const object to enforce strong typing.
 */
export const QUEUES = {
  NOTIFICATION: "notification-queue",
  MAINTENANCE: "maintenance-queue",
  AUDIT: "audit-queue",
  BOOKING: "booking-queue",
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];
