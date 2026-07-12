import { beforeEach, afterEach, vi } from "vitest";
import Redis from "ioredis";
import { redisConnection } from "../../src/lib/redis.js";

/**
 * Runs before each individual test suite/file.
 * Connects to Redis and flushes the database, ensuring that no keys or queues
 * bleed from previous tests.
 */
beforeEach(async () => {
  const connOpts = redisConnection as any;
  const client = new Redis({
    host: connOpts.host,
    port: connOpts.port,
    password: connOpts.password,
    db: connOpts.db,
    tls: connOpts.tls,
    connectTimeout: 2000,
    maxRetriesPerRequest: null,
  });

  try {
    await client.flushdb();
  } catch (error) {
    console.error("TestSetup: Failed to flush Redis database before test run", error);
  } finally {
    await client.quit();
  }
});

/**
 * Clean up mocks, mock timers, and standard configurations after each test spec.
 */
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.useRealTimers();
});
