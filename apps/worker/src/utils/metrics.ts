import { Redis, RedisOptions } from "ioredis";
import { redisConnection } from "../lib/redis.js";
import { QueueRegistry } from "../queues/registry.js";
import { workerRegistry } from "../processors/registry.js";
import { cronRegistry } from "../cron/registry.js";
import { logger } from "../logger/index.js";

/**
 * Basic in-memory performance counters for job telemetry.
 * Can be plugged directly into 'prom-client' or another metric collector later.
 */
export const metrics = {
  jobsProcessedTotal: 0,
  jobsFailedTotal: 0,
  jobsActiveCount: 0,

  incrementProcessed() {
    this.jobsProcessedTotal += 1;
  },

  incrementFailed() {
    this.jobsFailedTotal += 1;
  },

  setActive(count: number) {
    this.jobsActiveCount = count;
  },
};

/**
 * Assembles and returns the health status of the worker service, Redis, and queues.
 */
export async function checkHealth() {
  let redisConnected = false;
  let redisPingTimeMs = -1;

  try {
    const start = Date.now();
    let testClient: Redis;
    let needsQuit = false;

    if (redisConnection && typeof (redisConnection as any).ping === "function") {
      testClient = redisConnection as any;
    } else {
      const connOpts = redisConnection as RedisOptions;
      testClient = new Redis({
        host: connOpts.host,
        port: connOpts.port,
        password: connOpts.password,
        db: connOpts.db,
        tls: connOpts.tls,
        // Fail fast for health check ping
        connectTimeout: 2000,
      });
      needsQuit = true;
    }
    
    const response = await testClient.ping();
    redisConnected = response === "PONG";
    redisPingTimeMs = Date.now() - start;
    
    if (needsQuit) {
      await testClient.quit();
    }
  } catch (error) {
    logger.warn({ err: error }, "HealthCheck: Redis ping test failed");
    redisConnected = false;
  }

  // Fetch current length metrics of all queues
  let queueStats = {};
  try {
    queueStats = await QueueRegistry.getStats();
  } catch (error) {
    logger.error({ err: error }, "HealthCheck: Failed to fetch queue stats");
  }

  const memory = process.memoryUsage();

  return {
    status: redisConnected ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    system: {
      memoryHeapUsedMB: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
      memoryHeapTotalMB: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
      memoryRSSMB: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
    },
    redis: {
      connected: redisConnected,
      pingMs: redisPingTimeMs,
    },
    queues: queueStats,
    workers: workerRegistry.getActiveWorkers(),
    crons: cronRegistry.getRegisteredCrons(),
    telemetry: {
      jobsProcessedCount: metrics.jobsProcessedTotal,
      jobsFailedCount: metrics.jobsFailedTotal,
    },
  };
}
