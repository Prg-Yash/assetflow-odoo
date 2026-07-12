import { NotificationQueue } from "./notification.queue.js";
import { MaintenanceQueue } from "./maintenance.queue.js";
import { BookingQueue } from "./booking.queue.js";
import { AuditQueue } from "./audit.queue.js";
import { logger } from "../logger/index.js";

/**
 * Singleton Registry gathering all initialized BullMQ queues.
 * Used for simple importing and unified management of queues.
 */
class Registry {
  public readonly notification = new NotificationQueue();
  public readonly maintenance = new MaintenanceQueue();
  public readonly booking = new BookingQueue();
  public readonly audit = new AuditQueue();

  /**
   * Helper to retrieve all active queue instances
   */
  public getAll() {
    return [
      this.notification,
      this.maintenance,
      this.booking,
      this.audit,
    ];
  }

  /**
   * Get Basic health check/status metrics for all registered queues
   */
  public async getStats() {
    const stats: Record<string, any> = {};
    for (const queue of this.getAll()) {
      stats[queue.name] = await queue.getJobCounts();
    }
    return stats;
  }

  /**
   * Safe termination of all queue connections during graceful shutdown
   */
  public async closeAll() {
    logger.info("Registry: Shutting down all queue connections...");
    const closePromises = this.getAll().map((queue) =>
      queue
        .close()
        .catch((err) =>
          logger.error({ err, queue: queue.name }, `Failed to close queue cleanly`)
        )
    );
    await Promise.all(closePromises);
    logger.info("Registry: All queues closed");
  }
}

export const QueueRegistry = new Registry();
export default QueueRegistry;
