import { ConnectionOptions } from "bullmq";
import { env } from "../config/environment.js";

/**
 * Shared Redis Connection Options for BullMQ Queues and Workers.
 * 
 * IMPORTANT: BullMQ requires `maxRetriesPerRequest` to be set to `null`.
 * This is because BullMQ handles its own retry logic internally when
 * executing blocking commands. If this is not set to `null`, BullMQ will
 * throw an initialization error.
 */
export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  // If TLS is enabled (e.g. on managed Redis cloud clusters like RedisLabs/ElastiCache)
  tls: env.REDIS_USE_TLS ? {} : undefined,
  maxRetriesPerRequest: null,
};
export default redisConnection;
