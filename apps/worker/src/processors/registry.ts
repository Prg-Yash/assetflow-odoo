import { Worker, Job } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { env } from "../config/environment.js";
import { logger } from "../logger/index.js";
import { BaseProcessor } from "./base.processor.js";
import { NotificationProcessor } from "./notification.processor.js";
import { MaintenanceProcessor } from "./maintenance.processor.js";
import { BookingProcessor } from "./booking.processor.js";
import { AuditProcessor } from "./audit.processor.js";

/**
 * Registry coordinating the instantiation and lifecycle of all BullMQ Workers.
 */
class WorkerRegistry {
  private workers: Worker[] = [];
  private processors: BaseProcessor[] = [];

  constructor() {
    // Collect all active processors to instantiate
    this.processors = [
      new NotificationProcessor(),
      new MaintenanceProcessor(),
      new BookingProcessor(),
      new AuditProcessor(),
    ];
  }

  /**
   * Instantiates BullMQ workers for each registered processor,
   * applying individual queue concurrency limits and bindings.
   */
  public startAll(): void {
    logger.info("WorkerRegistry: Booting background job consumers...");

    for (const processor of this.processors) {
      const concurrency = this.getConcurrencyForQueue(processor.queueName);

      const worker = new Worker(
        processor.queueName,
        // Bind the process function to run within the processor's context
        async (job: Job) => {
          return processor.process(job);
        },
        {
          connection: redisConnection,
          concurrency,
          prefix: env.QUEUE_PREFIX,
        }
      );

      // Event listener for unhandled job failure events inside the queue worker thread
      worker.on("failed", (job, err) => {
        logger.error(
          {
            jobId: job?.id,
            queue: processor.queueName,
            jobName: job?.name,
            err,
          },
          `Worker event 'failed': Job ${job?.id} failed permanently: ${err.message}`
        );
      });

      // Event listener for connection errors or internal Redis system crashes
      worker.on("error", (err) => {
        logger.error(
          { queue: processor.queueName, err },
          `Worker event 'error': Fatal error occurred in worker system`
        );
      });

      this.workers.push(worker);
      logger.info(
        `Worker Registry: Consumer running for [${processor.queueName}] (concurrency: ${concurrency})`
      );
    }
  }

  /**
   * Performs graceful shutdown, completing in-progress jobs up to 30 seconds.
   * If a worker takes longer than 30 seconds to close gracefully, it will be force closed.
   */
  public async closeAll(): Promise<void> {
    logger.info("WorkerRegistry: Closing all job consumers...");
    const shutdownTimeoutMs = 30000;

    const closePromises = this.workers.map(async (worker) => {
      let timeoutId: NodeJS.Timeout | undefined;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Graceful shutdown timed out for worker ${worker.name}`));
        }, shutdownTimeoutMs);
      });

      try {
        await Promise.race([
          worker.close(false),
          timeoutPromise
        ]);
      } catch (err) {
        logger.warn(
          { err, queue: worker.name },
          `Graceful close timed out or failed. Forcing close...`
        );
        // Force close to stop active jobs and clean up Redis connections immediately
        await worker.close(true).catch((forceErr) =>
          logger.error(
            { err: forceErr, queue: worker.name },
            `Failed to force close worker`
          )
        );
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    });

    await Promise.all(closePromises);
    this.workers = [];
    logger.info("WorkerRegistry: All job consumers stopped");
  }

  /**
   * Helper to retrieve active worker instances for health check queries
   */
  public getActiveWorkers() {
    return this.workers.map((w) => ({
      name: w.name,
      isRunning: w.isRunning(),
    }));
  }

  /**
   * Map queue names to their configured concurrency levels from the validated environment
   */
  private getConcurrencyForQueue(queueName: string): number {
    switch (queueName) {
      case "notification-queue":
        return env.CONCURRENCY_NOTIFICATION;
      case "maintenance-queue":
        return env.CONCURRENCY_MAINTENANCE;
      case "audit-queue":
        return env.CONCURRENCY_AUDIT;
      case "booking-queue":
        return env.CONCURRENCY_BOOKING;
      default:
        return 5;
    }
  }
}

export const workerRegistry = new WorkerRegistry();
export default workerRegistry;
