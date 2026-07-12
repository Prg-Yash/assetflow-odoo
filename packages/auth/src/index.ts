import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@repo/db";
import { sendPasswordResetEmail } from "./password-reset-mailer.js";

function parseOrigins(value?: string): string[] {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const envOrigins = parseOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN);
const trustedOrigins = Array.from(
  new Set([
    ...envOrigins,
    "http://localhost:3000",
    "http://localhost:5001",
    "https://l2.aryanshinde.in",
    "https://lr2.aryanshinde.in",
  ]),
);

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5001",
  basePath: "/api/v1/auth",
  trustedOrigins,
  user: {
    additionalFields: {
      organizationId: {
        type: "string",
        required: false,
      },
      roleId: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
      },
    },
  },
  session: {
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
      });
    },
  },
});

export type Auth = typeof auth;
