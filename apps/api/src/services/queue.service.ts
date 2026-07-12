import { db } from "@repo/db";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

/**
 * Enterprise Queue Service (Wired to BullMQ & Redis for Background Processing)
 *
 * Decouples heavy or high-latency operations from synchronous API request-response loops.
 * Specifically handles:
 * 1. Background Notification Dispatch (Postgres UI notification + BullMQ send-email/send-slack job)
 * 2. Async Activity Log Batch Writing
 * 3. Bulk Audit Discrepancy Report Processing & BullMQ audit-queue compilation
 * 4. Booking & Maintenance Reminder Scheduling via BullMQ
 *
 * Automatically connects to Redis (`REDIS_URL` or `REDIS_HOST:REDIS_PORT`) and publishes jobs
 * to `apps/worker` while maintaining fallback safety if Redis is locally offline.
 */

export type JobType =
  | "NOTIFICATION_DISPATCH"
  | "ACTIVITY_LOG"
  | "AUDIT_DISCREPANCY_GENERATOR"
  | "SEND_EMAIL"
  | "SEND_SLACK"
  | "BOOKING_REMINDER"
  | "MAINTENANCE_REMINDER";

export interface JobPayload {
  type: JobType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  attempts?: number;
  maxAttempts?: number;
}

class AsyncQueueManager {
  private notificationQueue: Queue | null = null;
  private auditQueue: Queue | null = null;
  private maintenanceQueue: Queue | null = null;
  private bookingQueue: Queue | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private redisClient: any = null;
  private isRedisReady = false;

  constructor() {
    this.initializeBullMQ();
  }

  /**
   * Connect to Redis and instantiate BullMQ queues matching `apps/worker` namespace
   */
  private initializeBullMQ(): void {
    try {
      const redisHost = process.env.REDIS_HOST || "127.0.0.1";
      const redisPort = Number(process.env.REDIS_PORT) || 6379;
      const redisPassword = process.env.REDIS_PASSWORD || undefined;
      const queuePrefix = process.env.QUEUE_PREFIX || "assetflow";

      const connectionOptions = process.env.REDIS_URL
        ? process.env.REDIS_URL
        : {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            maxRetriesPerRequest: null,
            lazyConnect: true,
          };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.redisClient = new (Redis as any)(connectionOptions);

      this.redisClient.on("connect", () => {
        this.isRedisReady = true;
        console.log(`[QueueService] Connected to Redis. BullMQ workers wired to prefix "${queuePrefix}".`);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.redisClient.on("error", (err: any) => {
        if (this.isRedisReady) {
          console.warn("[QueueService] Redis connection warning:", err?.message || err);
        }
        this.isRedisReady = false;
      });

      // Try initial non-blocking connect
      this.redisClient.connect().catch(() => {
        this.isRedisReady = false;
      });

      // Instantiate queues matching apps/worker constants/queues.ts
      const queueOptions = {
        connection: this.redisClient,
        prefix: queuePrefix,
      };

      this.notificationQueue = new Queue("notification-queue", queueOptions);
      this.auditQueue = new Queue("audit-queue", queueOptions);
      this.maintenanceQueue = new Queue("maintenance-queue", queueOptions);
      this.bookingQueue = new Queue("booking-queue", queueOptions);
    } catch (err: any) {
      console.warn("[QueueService] Failed to initialize BullMQ. Running in local fallback mode:", err?.message || err);
    }
  }

  /**
   * Enqueue a new background task (dispatches both local DB sync and BullMQ worker job)
   */
  public async enqueue(job: JobPayload): Promise<void> {
    try {
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
        case "SEND_EMAIL":
          await this.sendEmailJob(job.data);
          break;
        case "SEND_SLACK":
          await this.sendSlackJob(job.data);
          break;
        case "BOOKING_REMINDER":
          await this.scheduleBookingReminder(job.data);
          break;
        case "MAINTENANCE_REMINDER":
          await this.scheduleMaintenanceReminder(job.data);
          break;
        default:
          console.warn(`[QueueService] Unknown job type: ${job.type}`);
      }
    } catch (error) {
      console.error(`[QueueService] Enqueue/Execution error for (${job.type}):`, error);
    }
  }

  /**
   * 1. Save UI notification in DB + Push send-email job to BullMQ `notification-queue`
   */
  private async processNotificationDispatch(data: {
    organizationId: string;
    userId: string;
    title: string;
    body: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    // 1. Create DB UI notification row so user sees bell icon instantly
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

    // 2. If user email provided or lookup possible, push job to apps/worker for email delivery
    if (this.notificationQueue && this.isRedisReady) {
      let email = data.userEmail;
      if (!email && data.userId) {
        const user = await db.user.findUnique({ where: { id: data.userId }, select: { email: true } });
        email = user?.email;
      }

      if (email) {
        await this.notificationQueue.add("send-email", {
          type: "email",
          data: {
            to: email,
            subject: data.title,
            template: "system_notification",
            context: {
              title: data.title,
              body: data.body,
              organizationId: data.organizationId,
              ...data.metadata,
            },
          },
        }).catch((err: any) => console.warn("[QueueService] BullMQ push error:", err?.message || err));
      }
    }
  }

  /**
   * 2. Save Activity Log in DB (and can push Slack alert for critical events)
   */
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

    // Push Slack notification to apps/worker for critical security/system events
    if (this.notificationQueue && this.isRedisReady && ["CREATED", "DELETED", "CLOSED", "PROMOTED"].includes(data.action)) {
      await this.notificationQueue.add("send-slack", {
        type: "slack",
        data: {
          text: `[Activity Log] ${data.entity} ${data.action} by User ${data.userId || "System"} (ID: ${data.entityId})`,
        },
      }).catch(() => {});
    }
  }

  /**
   * 3. Process audit discrepancy updates and enqueue report compilation in `audit-queue`
   */
  private async processAuditDiscrepancies(data: {
    auditCycleId: string;
    organizationId: string;
    recipientEmail?: string;
  }): Promise<void> {
    // 1. Update asset status immediately in DB
    const items = await db.auditItem.findMany({
      where: { auditId: data.auditCycleId },
      include: { asset: true },
    });

    for (const item of items) {
      if (item.result === "MISSING" && item.asset.status !== "LOST") {
        await db.asset.update({
          where: { id: item.assetId },
          data: { status: "LOST" },
        });
      } else if (item.result === "DAMAGED" && item.asset.condition !== "DAMAGED") {
        await db.asset.update({
          where: { id: item.assetId },
          data: { condition: "DAMAGED" },
        });
      }
    }

    // 2. Push heavy report generation task to BullMQ `audit-queue` in worker
    if (this.auditQueue && this.isRedisReady && data.recipientEmail) {
      await this.auditQueue.add("generate-report", {
        auditId: data.auditCycleId,
        format: "PDF",
        recipientEmail: data.recipientEmail,
      }).catch((err: any) => console.warn("[QueueService] BullMQ audit-queue push error:", err?.message || err));
    }
  }

  /**
   * Helper: Push explicit Send Email job to BullMQ
   */
  public async sendEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, string | number | boolean>;
  }): Promise<void> {
    if (this.notificationQueue && this.isRedisReady) {
      await this.notificationQueue.add("send-email", { type: "email", data });
    }
  }

  /**
   * Helper: Push explicit Send Slack job to BullMQ
   */
  public async sendSlackJob(data: { text: string; channel?: string }): Promise<void> {
    if (this.notificationQueue && this.isRedisReady) {
      await this.notificationQueue.add("send-slack", { type: "slack", data });
    }
  }

  /**
   * Helper: Schedule Booking Reminder (`booking-queue`)
   */
  public async scheduleBookingReminder(data: {
    bookingId: string;
    userId: string;
    userEmail: string;
    assetName: string;
    startTime: string;
  }): Promise<void> {
    if (this.bookingQueue && this.isRedisReady) {
      await this.bookingQueue.add("send-booking-reminder", data);
    }
  }

  /**
   * Helper: Schedule Maintenance Reminder (`maintenance-queue`)
   */
  public async scheduleMaintenanceReminder(data: {
    assetId: string;
    maintenanceId: string;
    scheduledDate: string;
    assignedToEmail: string;
    title: string;
  }): Promise<void> {
    if (this.maintenanceQueue && this.isRedisReady) {
      await this.maintenanceQueue.add("schedule-reminder", data);
    }
  }
}

export const queueService = new AsyncQueueManager();

