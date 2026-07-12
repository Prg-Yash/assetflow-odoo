import { Job } from "bullmq";
import { logger } from "../logger/index.js";

/**
 * Base Processor Class that standardizes job execution, routing, and telemetry logging.
 * Subclasses define the queue name and mapping of job names to specific handler functions.
 */
export abstract class BaseProcessor {
  public abstract readonly queueName: string;

  // Concrete processors must implement this map of jobName -> execution function
  protected abstract handlers: Record<string, (job: Job) => Promise<any>>;

  /**
   * Universal process function invoked by BullMQ Worker threads.
   * Manages job routing, execution-time metrics, payload measurements, and structured logs.
   */
  public async process(job: Job): Promise<any> {
    const startTime = Date.now();
    const payloadSize = job.data ? Buffer.byteLength(JSON.stringify(job.data)) : 0;

    // Create a contextual child logger with trace data
    const jobLogger = logger.child({
      jobId: job.id,
      queueName: this.queueName,
      jobName: job.name,
      retryCount: job.attemptsMade,
      payloadSizeBytes: payloadSize,
    });

    jobLogger.info("Job execution started");

    try {
      const handler = this.handlers[job.name];
      
      if (!handler) {
        throw new Error(
          `No registered handler found for job "${job.name}" on queue "${this.queueName}"`
        );
      }

      // Execute specific job handler
      const result = await handler.call(this, job);

      const duration = Date.now() - startTime;
      jobLogger.info(
        { durationMs: duration, success: true },
        `Job execution completed successfully`
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error as Error;

      jobLogger.error(
        {
          err,
          stackTrace: err.stack,
          durationMs: duration,
          success: false,
        },
        `Job execution failed: ${err.message}`
      );

      // Re-throw so BullMQ is notified of failure and schedules retries / backoffs
      throw error;
    }
  }
}
