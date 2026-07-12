import { Queue, Job } from "bullmq";
import { QueueRegistry } from "../../src/queues/registry.js";
import { workerRegistry } from "../../src/processors/registry.js";
import { cronRegistry } from "../../src/cron/registry.js";

/**
 * Clean helper function to await a BullMQ job state.
 * Prevents flaky, sleep-based checks by polling the job status.
 */
export async function waitForJobState(
  queueName: string,
  jobId: string,
  state: "completed" | "failed" | "active" | "delayed" | "waiting",
  timeoutMs = 6000
): Promise<Job> {
  const queueInstance = QueueRegistry.getAll().find((q) => q.name === queueName);
  if (!queueInstance) {
    throw new Error(`Queue registry does not contain a queue named: ${queueName}`);
  }
  const rawQueue = queueInstance.getRawQueue();

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const job = await rawQueue.getJob(jobId);
    if (job) {
      const currentState = await job.getState();
      if (currentState === state) {
        return job;
      }
      // If we are waiting for completion but it failed, return immediately to fail fast
      if (state === "completed" && currentState === "failed") {
        throw new Error(`Job ${jobId} failed permanently: ${job.failedReason}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for job ${jobId} to reach state "${state}" on queue [${queueName}]`);
}

/**
 * Helper to wait until a queue reaches a certain count of jobs in a specific status.
 */
export async function waitForQueueCount(
  queueName: string,
  status: "wait" | "active" | "completed" | "failed" | "delayed",
  targetCount: number,
  timeoutMs = 6000
): Promise<number> {
  const queueInstance = QueueRegistry.getAll().find((q) => q.name === queueName);
  if (!queueInstance) {
    throw new Error(`Queue registry does not contain queue: ${queueName}`);
  }
  const rawQueue = queueInstance.getRawQueue();

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const counts = await rawQueue.getJobCounts();
    const count = counts[status] ?? 0;
    if (count >= targetCount) {
      return count;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const counts = await rawQueue.getJobCounts();
  throw new Error(
    `Timeout waiting for queue [${queueName}] to reach ${targetCount} jobs with status "${status}". Current count: ${counts[status]}`
  );
}

/**
 * Boots the worker registry and crons together for integration/e2e flows.
 */
export async function startWorkerService(): Promise<void> {
  workerRegistry.startAll();
  await cronRegistry.startAll();
}

/**
 * Safely shuts down workers, cancels repeatability timers, and shuts down connections.
 */
export async function stopWorkerService(): Promise<void> {
  await cronRegistry.cancelAll();
  await workerRegistry.closeAll();
  await QueueRegistry.closeAll();
}
