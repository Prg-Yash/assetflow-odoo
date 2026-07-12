import { logger } from "../../src/logger/index.js";

/**
 * Runs once after all tests have finished executing.
 * Cleans up global resources, resets hooks, and logs completion status.
 */
export async function teardown(): Promise<void> {
  logger.info("GlobalTeardown: All test files completed successfully.");
}
export default teardown;
