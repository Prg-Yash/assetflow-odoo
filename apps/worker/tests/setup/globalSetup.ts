import Redis from "ioredis";
import { redisConnection } from "../../src/lib/redis.js";
import { logger } from "../../src/logger/index.js";

/**
 * Runs once before all test files start.
 * Verifies that the required testing dependencies (specifically local Redis) are running
 * and logs validation checkpoints.
 */
export async function setup(): Promise<void> {
  // Silence regular app logs during test execution unless debugging is active
  if (!process.env.DEBUG_TESTS) {
    logger.level = "silent";
  }

  logger.info("GlobalSetup: Initializing worker test suite verification...");

  try {
    const connOpts = redisConnection as any;
    const testClient = new Redis({
      host: connOpts.host,
      port: connOpts.port,
      password: connOpts.password,
      db: connOpts.db,
      tls: connOpts.tls,
      connectTimeout: 3000,
      maxRetriesPerRequest: null,
    });

    const response = await testClient.ping();
    if (response !== "PONG") {
      throw new Error(`Redis ping returned invalid status: ${response}`);
    }

    await testClient.quit();
    logger.info("GlobalSetup: Redis connection verified successfully");
  } catch (error) {
    const err = error as Error;
    console.error("\n==================================================");
    console.error("❌ GLOBAL TEST BOOT STRAP FAILURE: Redis is offline!");
    console.error(`Reason: ${err.message}`);
    console.error("Please run: docker run -d --name redis-local -p 6379:6379 redis:alpine");
    console.error("==================================================\n");
    process.exit(1);
  }
}
export default setup;
