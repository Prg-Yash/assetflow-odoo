import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "../logger/index.js";

// Load environment variables from .env file
dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  
  // Redis connection configuration
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().or(z.literal("")),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  REDIS_USE_TLS: z.preprocess(
    (val) => val === "true" || val === "1" || val === true,
    z.boolean()
  ).default(false),

  // Queue system custom namespace prefix
  QUEUE_PREFIX: z.string().default("assetflow"),

  // Cron schedule enabled flag
  CRON_ENABLED: z.preprocess(
    (val) => val === "true" || val === "1" || val === true,
    z.boolean()
  ).default(true),

  // Concurrencies for each specific queue processor
  CONCURRENCY_NOTIFICATION: z.coerce.number().int().positive().default(10),
  CONCURRENCY_MAINTENANCE: z.coerce.number().int().positive().default(5),
  CONCURRENCY_AUDIT: z.coerce.number().int().positive().default(2),
  CONCURRENCY_BOOKING: z.coerce.number().int().positive().default(5),

  // Notification integrations
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional().or(z.literal("")),
  SMTP_PASS: z.string().optional().or(z.literal("")),
  SMTP_FROM_EMAIL: z.string().email().default("noreply@assetflow.com"),

  TWILIO_ACCOUNT_SID: z.string().optional().or(z.literal("")),
  TWILIO_AUTH_TOKEN: z.string().optional().or(z.literal("")),
  TWILIO_FROM_PHONE: z.string().optional().or(z.literal("")),

  SLACK_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
});

export type Environment = z.infer<typeof environmentSchema>;

// Validate and parse the environment variables
const parseEnvironment = (): Environment => {
  try {
    return environmentSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.fatal({ errors: error.format() }, "Environment variable validation failed!");
      process.exit(1);
    }
    logger.fatal({ err: error }, "Unexpected error parsing environment configuration.");
    process.exit(1);
  }
};

export const env = parseEnvironment();
