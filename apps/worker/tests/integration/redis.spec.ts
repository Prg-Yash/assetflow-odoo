import { describe, it, expect, vi } from "vitest";
import Redis from "ioredis";
import { checkHealth } from "../../src/utils/metrics.js";
import { redisConnection } from "../../src/lib/redis.js";
import { env } from "../../src/config/environment.js";

describe("Redis Connection Integration Tests", () => {
  it("should verify connection succeeds and checkHealth returns healthy state", async () => {
    const health = await checkHealth();
    expect(health.status).toBe("healthy");
    expect(health.redis.connected).toBe(true);
    expect(health.redis.pingMs).toBeGreaterThanOrEqual(0);
  });

  it("should handle Redis connection timeouts or connection failures in checkHealth gracefully", async () => {
    // Force Redis client ping method to throw an error, simulating an offline state
    const pingSpy = vi.spyOn(Redis.prototype, "ping").mockRejectedValue(new Error("Connection refused"));

    const health = await checkHealth();

    expect(health.status).toBe("unhealthy");
    expect(health.redis.connected).toBe(false);
    expect(health.redis.pingMs).toBe(-1);

    pingSpy.mockRestore();
  });

  it("should verify that the central Redis connection configuration is exported with correct settings", () => {
    expect(redisConnection.host).toBe(env.REDIS_HOST);
    expect(redisConnection.port).toBe(env.REDIS_PORT);
    expect(redisConnection.db).toBe(env.REDIS_DB);
    // Crucial setting for BullMQ must be null
    expect(redisConnection.maxRetriesPerRequest).toBeNull();
  });
});
