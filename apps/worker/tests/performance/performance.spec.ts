import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueueRegistry } from "../../src/queues/registry.js";
import { workerRegistry } from "../../src/processors/registry.js";
import { JOBS } from "../../src/constants/jobs.js";
import { QUEUES } from "../../src/constants/queues.js";
import { logger } from "../../src/logger/index.js";
import { waitForQueueCount } from "../helpers/worker.helper.js";

describe("Performance & Concurrency Smoke Benchmarks", () => {
  beforeEach(() => {
    vi.spyOn(logger, "info").mockImplementation(() => logger);
    vi.spyOn(logger, "warn").mockImplementation(() => logger);
    vi.spyOn(logger, "error").mockImplementation(() => logger);
  });

  afterEach(async () => {
    await workerRegistry.closeAll();
  });

  it("should process 100 enqueued jobs concurrently and measure latency & memory stats", async () => {
    const jobCount = 100;
    const mockJobs = Array.from({ length: jobCount }).map((_, i) => ({
      name: JOBS.NOTIFICATION.SEND_SMS,
      data: {
        type: "sms" as const,
        data: {
          to: `+123456789${i}`,
          body: `Concurrency test message ${i}`,
        },
      },
    }));

    const memStart = process.memoryUsage().heapUsed;
    const enqueueStart = Date.now();

    // 1. Bulk insert jobs for transaction speed
    await QueueRegistry.notification.bulkAdd(mockJobs);
    
    const enqueueDuration = Date.now() - enqueueStart;

    // 2. Start the worker consumers to process jobs concurrently
    const processStart = Date.now();
    workerRegistry.startAll();

    // 3. Await completion of all 100 SMS notification jobs
    await waitForQueueCount(QueueRegistry.notification.name, "completed", jobCount, 8000);
    
    const processDuration = Date.now() - processStart;
    const memEnd = process.memoryUsage().heapUsed;

    const memoryDiffMB = Math.round((memEnd - memStart) / 1024 / 1024 * 100) / 100;

    // Output performance metrics to the console
    console.log("\n==================================================");
    console.log("⚡ CONCURRENCY PERFORMANCE BENCHMARK RESULTS");
    console.log(`- Enqueued: ${jobCount} jobs`);
    console.log(`- Enqueue Time: ${enqueueDuration}ms (${Math.round(jobCount / (enqueueDuration / 1000))} jobs/sec)`);
    console.log(`- Processing Time: ${processDuration}ms (${Math.round(jobCount / (processDuration / 1000))} jobs/sec)`);
    console.log(`- Heap Delta: ${memoryDiffMB > 0 ? "+" : ""}${memoryDiffMB} MB`);
    console.log("==================================================\n");

    // Assertions
    const counts = await QueueRegistry.notification.getJobCounts();
    expect(counts.completed).toBe(jobCount);
    expect(counts.failed).toBe(0);
    expect(counts.wait).toBe(0);
    expect(counts.active).toBe(0);
  });
});
