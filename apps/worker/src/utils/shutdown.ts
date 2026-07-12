import { logger } from "../logger/index.js";
import { QueueRegistry } from "../queues/registry.js";
import { workerRegistry } from "../processors/registry.js";
import { cronRegistry } from "../cron/registry.js";

let isShuttingDown = false;

/**
 * Attaches listeners to system termination signals (SIGINT, SIGTERM)
 * to coordinate a zero-downtime, lossless graceful shutdown.
 */
export function setupGracefulShutdown(): void {
  const handleShutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn(`Shutdown: Received secondary ${signal} signal. Forcing exit!`);
      process.exit(1);
    }

    isShuttingDown = true;
    logger.info(`Shutdown: Received ${signal}. Commencing graceful worker shutdown...`);

    // Setup an emergency backup timeout to force exit if cleanup hangs (e.g. infinite loop)
    const forceExitTimeout = setTimeout(() => {
      logger.fatal("Shutdown: Graceful shutdown timed out. Forcing process exit.");
      process.exit(1);
    }, 45000); // 45 seconds backup limit

    try {
      // 1. Deregister cron/repeatable scheduling from Redis
      await cronRegistry.cancelAll();

      // 2. Shut down all queue consumers (stops polling, finishes active jobs)
      await workerRegistry.closeAll();

      // 3. Shut down all queue connection pools
      await QueueRegistry.closeAll();

      clearTimeout(forceExitTimeout);
      logger.info("Shutdown: Clean graceful shutdown finished. Exiting process.");
      
      // Flush pino logs and exit
      process.nextTick(() => {
        process.exit(0);
      });
    } catch (error) {
      logger.error({ err: error }, "Shutdown: Error occurred during graceful shutdown sequence");
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  };

  // Listen for docker/k8s orchestrator signals
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  // Listen for terminal interrupt signals (e.g. Ctrl + C)
  process.on("SIGINT", () => handleShutdown("SIGINT"));

  // Handle uncaught exceptions and unhandled rejections to prevent silent deaths
  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "System encountered an uncaught exception!");
    handleShutdown("UNCAUGHT_EXCEPTION");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "System encountered an unhandled promise rejection");
  });
}
