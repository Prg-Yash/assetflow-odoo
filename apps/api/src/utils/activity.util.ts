import { db } from "@repo/db";

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
}: {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
}) {
  try {
    await db.notification.create({
      data: {
        organizationId,
        userId,
        title,
        body,
        type,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
