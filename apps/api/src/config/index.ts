import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  path.resolve(__dirname, "../../../.env"),
  path.resolve(__dirname, "../../../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath, override: false });
}

function parseOrigins(value?: string): string[] {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN);
const fallbackOrigins = [
  "http://localhost:3000",
  "http://localhost:5001",
  "https://l2.aryanshinde.in",
  "https://lr2.aryanshinde.in",
];
const corsOrigins = Array.from(new Set([...(configuredOrigins.length ? configuredOrigins : fallbackOrigins)]));

export const config = {
  port: parseInt(process.env.PORT || "5001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: corsOrigins[0] || "http://localhost:3000",
  corsOrigins,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
  betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:5001",
  aws: {
    region: process.env.S3_REGION,
    bucketName: process.env.S3_BUCKET_NAME,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
  },
};

export type Config = typeof config;
