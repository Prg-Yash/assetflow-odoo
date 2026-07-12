import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { workerRegistry } from "../../src/processors/registry.js";
import { QueueRegistry } from "../../src/queues/registry.js";
import { cronRegistry } from "../../src/cron/registry.js";
import { setupGracefulShutdown } from "../../src/utils/shutdown.js";
import { JOBS } from "../../src/constants/jobs.js";
import { QUEUES } from "../../src/constants/queues.js";
import { logger } from "../../src/logger/index.js";
import { waitForJobState, startWorkerService, stopWorkerService } from "../helpers/worker.helper.js";

describe("Worker Lifecycle & Signal Integration Tests", () => {
  beforeEach(() => {
    vi.spyOn(logger, "info").mockImplementation(() => logger);
    vi.spyOn(logger, "warn").mockImplementation(() => logger);
    vi.spyOn(logger, "error").mockImplementation(() => logger);
    vi.spyOn(logger, "fatal").mockImplementation(() => logger);
  });

  afterEach(async () => {
    // Force cleanup workers and queues after each test spec to avoid lock collisions
    await workerRegistry.closeAll();
    await cronRegistry.cancelAll();
  });

  it("should boot all workers and verify correct registration", () => {
    workerRegistry.startAll();

    const activeWorkers = workerRegistry.getActiveWorkers();
    expect(activeWorkers.length).toBe(4);

    expect(activeWorkers.some((w) => w.name === QUEUES.NOTIFICATION)).toBe(true);
    expect(activeWorkers.some((w) => w.name === QUEUES.MAINTENANCE)).toBe(true);
    expect(activeWorkers.some((w) => w.name === QUEUES.BOOKING)).toBe(true);
    expect(activeWorkers.some((w) => w.name === QUEUES.AUDIT)).toBe(true);
    
    // Ensure all workers are marked as running
    activeWorkers.forEach((w) => {
      expect(w.isRunning).toBe(true);
    });
  });

  it("should handle graceful shutdown and allow running jobs to complete", async () => {
    // 1. Enqueue an audit report job (which takes 5 seconds, but we will mock it to take 1.5 seconds)
    const originalTimeout = global.setTimeout;
    const reportJob = await QueueRegistry.audit.generateReport(
      "graceful-audit-1",
      "CSV",
      "graceful@company.com"
    );

    // Start workers
    workerRegistry.startAll();

    // 2. Wait 300ms to ensure the job moves to "active" state
    await new Promise((resolve) => originalTimeout(resolve, 300));
    
    const activeJobs = await QueueRegistry.audit.getRawQueue().getJobs(["active"]);
    expect(activeJobs.length).toBeGreaterThan(0);

    // 3. Trigger closeAll() while the job is active
    const closePromise = workerRegistry.closeAll();

    // 4. Await both the close registry and the job completion
    await closePromise;
    const completedJob = await waitForJobState(QueueRegistry.audit.name, reportJob.id!, "completed");
    
    expect(completedJob).toBeDefined();
    
    // Ensure workers were terminated after job completion
    const activeWorkers = workerRegistry.getActiveWorkers();
    expect(activeWorkers.length).toBe(0);
  });

  it("should respond to SIGTERM signals, cancel crons, close workers, and exit cleanly", async () => {
    // Mock process.exit to prevent the test runner from exiting
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    
    // Spy on teardown registries
    const cronCancelSpy = vi.spyOn(cronRegistry, "cancelAll");
    const workerCloseSpy = vi.spyOn(workerRegistry, "closeAll");
    const queueCloseSpy = vi.spyOn(QueueRegistry, "closeAll");

    // Initialize shutdown bindings
    setupGracefulShutdown();

    // Start elements
    workerRegistry.startAll();
    await cronRegistry.startAll();

    // Emit termination signal
    process.emit("SIGTERM");

    // Await async event loop iterations
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(cronCancelSpy).toHaveBeenCalled();
    expect(workerCloseSpy).toHaveBeenCalled();
    expect(queueCloseSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });
});
