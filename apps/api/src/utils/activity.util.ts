import { db } from "@repo/db";
import { queueService } from "../services/queue.service.js";

export async function recordActivityLog({
  organizationId,
  userId,
  entity,
  entityId,
  action,
  metadata,
}: {
  organizationId: string;
  userId?: string;
  entity: string;
  entityId: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}) {
  try {
    // 1. Immediately record in database for synchronous audit trail access
    await db.activityLog.create({
      data: {
        organizationId,
        userId: userId || null,
        entity,
        entityId,
        action,
        metadata: metadata || {},
      },
    });

    // 2. Offload Slack notifications / external audit streaming to background worker
    queueService.enqueue({
      type: "ACTIVITY_LOG",
      data: {
        organizationId,
        userId,
        entity,
        entityId,
        action,
        metadata,
      },
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
  }
}

export async function createNotification({
  organizationId,
  userId,
  title,
  body,
  type,
  userEmail,
}: {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  userEmail?: string;
}) {
  try {
    // 1. Immediately create in DB so the UI bell icon updates in real time
    await db.notification.create({
      data: {
        organizationId,
        userId,
        title,
        body,
        type,
      },
    });

    // 2. Enqueue background job to apps/worker (`notification-queue`) for email/slack delivery
    queueService.enqueue({
      type: "NOTIFICATION_DISPATCH",
      data: {
        organizationId,
        userId,
        title,
        body,
        userEmail,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

