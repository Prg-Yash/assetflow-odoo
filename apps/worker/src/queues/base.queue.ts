import { Queue, JobsOptions, BulkJobOptions } from "bullmq";
import { redisConnection } from "../lib/redis.js";
import { env } from "../config/environment.js";
import { logger } from "../logger/index.js";

/**
 * Base Queue Wrapper providing unified helper methods for BullMQ queue operations.
 * Automatically configures:
 *  - Queue naming prefix namespace
 *  - Default retry attempts (3) with exponential backoff (starting at 2s)
 *  - Garbage collection (removeOnComplete: 1000 items, removeOnFail: 5000 items)
 *  - Shared Redis connection options
 */
export class BaseQueue<TJobPayload = any> {
  protected queue: Queue<TJobPayload, any, string, TJobPayload, any, string>;
  public readonly name: string;

  constructor(queueName: string, defaultOptions: JobsOptions = {}) {
    this.name = queueName;

    // Build default options with safe production defaults (retries + storage limits)
    const mergedDefaultOptions: JobsOptions = {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // Wait 2s, then 4s, then 8s
      },
      removeOnComplete: {
        count: 1000,
        age: 24 * 3600, // 24 hours
      },
      removeOnFail: {
        count: 5000,
        age: 7 * 24 * 3600, // 7 days (keep failures around for DLQ style manual inspections)
      },
      ...defaultOptions,
    };

    // Instantiate BullMQ Queue
    this.queue = new Queue<TJobPayload, any, string, TJobPayload, any, string>(queueName, {
      connection: redisConnection,
      prefix: env.QUEUE_PREFIX,
      defaultJobOptions: mergedDefaultOptions,
    });

    logger.debug(`Queue [${this.name}] initialized with prefix "${env.QUEUE_PREFIX}"`);
  }

  /**
   * Add a standard job to the queue
   */
  public async addJob(
    jobName: string,
    data: TJobPayload,
    opts?: JobsOptions
  ) {
    try {
      const job = await this.queue.add(jobName, data, opts);
      logger.info(
        { jobId: job.id, queue: this.name, jobName },
        `Successfully added job to queue`
      );
      return job;
    } catch (error) {
      logger.error(
        { err: error, queue: this.name, jobName },
        `Failed to add job to queue`
      );
      throw error;
    }
  }

  /**
   * Add a delayed job (to be executed after some duration)
   */
  public async addDelayed(
    jobName: string,
    data: TJobPayload,
    delayMs: number,
    opts?: JobsOptions
  ) {
    return this.addJob(jobName, data, {
      ...opts,
      delay: delayMs,
    });
  }

  /**
   * Add a repeatable (cron) job to the queue.
   */
  public async addRepeatable(
    jobName: string,
    data: TJobPayload,
    cronExpression: string,
    opts?: JobsOptions
  ) {
    try {
      const job = await this.queue.add(jobName, data, {
        ...opts,
        repeat: {
          pattern: cronExpression,
        },
      });
      logger.info(
        { jobId: job.id, queue: this.name, jobName, cronExpression },
        `Successfully registered repeatable (cron) job`
      );
      return job;
    } catch (error) {
      logger.error(
        { err: error, queue: this.name, jobName, cronExpression },
        `Failed to register repeatable job`
      );
      throw error;
    }
  }

  /**
   * Add jobs in bulk for optimized Redis transaction performance
   */
  public async bulkAdd(
    jobs: { name: string; data: TJobPayload; opts?: BulkJobOptions }[]
  ) {
    try {
      const formattedJobs = jobs.map((job) => ({
        name: job.name,
        data: job.data,
        opts: job.opts,
      }));
      const createdJobs = await this.queue.addBulk(formattedJobs);
      logger.info(
        { queue: this.name, count: createdJobs.length },
        `Successfully added bulk jobs to queue`
      );
      return createdJobs;
    } catch (error) {
      logger.error(
        { err: error, queue: this.name },
        `Failed to add bulk jobs to queue`
      );
      throw error;
    }
  }

  /**
   * Remove a job from the queue by its ID
   */
  public async removeJob(jobId: string) {
    try {
      const job = await this.queue.getJob(jobId);
      if (job) {
        await job.remove();
        logger.info({ jobId, queue: this.name }, `Removed job from queue`);
      } else {
        logger.warn({ jobId, queue: this.name }, `Attempted to remove non-existent job`);
      }
    } catch (error) {
      logger.error({ err: error, jobId, queue: this.name }, `Failed to remove job`);
      throw error;
    }
  }

  /**
   * Cancel/Remove a repeatable job based on its cron configuration
   */
  public async cancelRepeatable(
    jobName: string,
    cronExpression: string,
    jobId?: string
  ) {
    try {
      await this.queue.removeRepeatable(jobName, {
        pattern: cronExpression,
        jobId,
      });
      logger.info(
        { queue: this.name, jobName, cronExpression },
        `Successfully cancelled repeatable job`
      );
    } catch (error) {
      logger.error(
        { err: error, queue: this.name, jobName, cronExpression },
        `Failed to cancel repeatable job`
      );
      throw error;
    }
  }

  /**
   * Get basic queue status counts
   */
  public async getJobCounts() {
    return this.queue.getJobCounts(
      "wait",
      "active",
      "completed",
      "failed",
      "delayed",
      "paused"
    );
  }

  /**
   * Clean up queue resources (used during graceful shutdown)
   */
  public async close() {
    logger.debug(`Closing queue [${this.name}]...`);
    await this.queue.close();
    logger.info(`Queue [${this.name}] closed successfully`);
  }

  /**
   * Expose raw BullMQ queue for custom needs
   */
  public getRawQueue() {
    return this.queue;
  }
}
