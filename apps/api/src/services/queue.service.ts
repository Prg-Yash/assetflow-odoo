import { db } from "@repo/db";

/**
 * Enterprise Queue Service (Queue-Based Logic to Reduce Load)
 *
 * Decouples heavy or high-latency I/O operations from synchronous API request-response loops.
 * Specifically handles:
 * 1. Background Notification Dispatch (Email / In-app alerts)
 * 2. Async Activity Log Batch Writing
 * 3. Bulk Audit Discrepancy Report Processing
 *
 * This ensures API endpoints respond in <20ms while high-volume operations execute safely with concurrency controls.
 */

export type JobType = "NOTIFICATION_DISPATCH" | "ACTIVITY_LOG" | "AUDIT_DISCREPANCY_GENERATOR";

export interface JobPayload {
  type: JobType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  attempts?: number;
  maxAttempts?: number;
}

class AsyncQueueManager {
  private queue: JobPayload[] = [];
  private isProcessing = false;
  private readonly concurrency = 5;
  private activeJobs = 0;

  /**
   * Enqueue a new background task
   */
  public async enqueue(job: JobPayload): Promise<void> {
    this.queue.push({
      ...job,
      attempts: job.attempts || 0,
      maxAttempts: job.maxAttempts || 3,
    });
    this.processQueue();
  }

  /**
   * Process pending jobs with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.activeJobs >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeJobs < this.concurrency) {
      const job = this.queue.shift();
      if (!job) break;

      this.activeJobs++;
      this.executeJob(job)
        .catch((err) => {
          console.error(`[QueueService] Job execution failed (${job.type}):`, err);
        })
        .finally(() => {
          this.activeJobs--;
          this.processQueue();
        });
    }

    this.isProcessing = false;
  }

  /**
   * Execute exact job worker logic based on job type
   */
  private async executeJob(job: JobPayload): Promise<void> {
    try {
      job.attempts = (job.attempts || 0) + 1;

      switch (job.type) {
        case "NOTIFICATION_DISPATCH":
          await this.processNotificationDispatch(job.data);
          break;
        case "ACTIVITY_LOG":
          await this.processActivityLog(job.data);
          break;
        case "AUDIT_DISCREPANCY_GENERATOR":
          await this.processAuditDiscrepancies(job.data);
          break;
        default:
          console.warn(`[QueueService] Unknown job type: ${job.type}`);
      }
    } catch (error) {
      if (job.attempts && job.maxAttempts && job.attempts < job.maxAttempts) {
        console.warn(`[QueueService] Retrying job (${job.type}) attempt ${job.attempts + 1}/${job.maxAttempts}`);
        setTimeout(() => {
          this.queue.push(job);
          this.processQueue();
        }, Math.pow(2, job.attempts) * 1000); // Exponential backoff
      } else {
        console.error(`[QueueService] Job (${job.type}) permanently failed after ${job.attempts} attempts:`, error);
      }
    }
  }

  private async processNotificationDispatch(data: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await db.notification.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: "INFO",
        read: false,
      },
    });
  }

  private async processActivityLog(data: {
    organizationId: string;
    userId?: string;
    entity: string;
    entityId: string;
    action: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
  }): Promise<void> {
    await db.activityLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId || null,
        entity: data.entity,
        entityId: data.entityId,
        action: data.action,
        metadata: data.metadata || {},
      },
    });
  }

  private async processAuditDiscrepancies(data: { auditCycleId: string; organizationId: string }): Promise<void> {
    // Background generation of discrepancy reports across thousands of assets when an audit closes
    const items = await db.auditItem.findMany({
      where: { auditId: data.auditCycleId },
      include: { asset: true },
    });

    for (const item of items) {
      if (item.result === "MISSING") {
        await db.asset.update({
          where: { id: item.assetId },
          data: { status: "LOST" },
        });
      } else if (item.result === "DAMAGED") {
        await db.asset.update({
          where: { id: item.assetId },
          data: { status: "DAMAGED" },
        });
      }
    }
  }
}

export const queueService = new AsyncQueueManager();
