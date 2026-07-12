import pino from "pino";

// Determine if we're in development to enable pretty printing
const isDev = process.env.NODE_ENV !== "production";

/**
 * Global structured logger using Pino.
 * Emits JSON in production for ELK/Splunk/Datadog ingestion,
 * and clean colorized terminal outputs in local development.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    env: process.env.NODE_ENV || "development",
    service: "assetflow-worker",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "yyyy-mm-dd HH:MM:ss.l",
        },
      }
    : undefined,
});
