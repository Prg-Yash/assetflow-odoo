import { env } from "./config/environment.js";
import { logger } from "./logger/index.js";
import { workerRegistry } from "./processors/registry.js";
import { cronRegistry } from "./cron/registry.js";
import { setupGracefulShutdown } from "./utils/shutdown.js";
import { checkHealth } from "./utils/metrics.js";

/**
 * Entry Point of the Background Job Worker Service.
 */
async function bootstrap() {
  logger.info("==================================================");
  logger.info("  Starting AssetFlow Background Worker Service    ");
  logger.info(`  Environment: ${env.NODE_ENV}                     `);
  logger.info(`  Queue Namespace Prefix: ${env.QUEUE_PREFIX}      `);
  logger.info("==================================================");

  try {
    // 1. Set up process signal bindings for graceful shutdowns
    setupGracefulShutdown();

    // 2. Spin up queue consumers (Workers)
    workerRegistry.startAll();

    // 3. Register cron schedules if applicable
    await cronRegistry.startAll();

    // 4. Perform an initial health check to verify connections
    logger.debug("Performing initial service self-check...");
    const health = await checkHealth();
    
    logger.info(
      {
        status: health.status,
        redisConnected: health.redis.connected,
        loadedWorkersCount: health.workers.length,
        loadedCronsCount: health.crons.length,
      },
      "System initialized successfully and ready to process jobs"
    );
  } catch (error) {
    logger.fatal(
      { err: error },
      "Fatal crash occurred during application bootstrap phase!"
    );
    process.exit(1);
  }
}

// Fire up the engine
bootstrap();
