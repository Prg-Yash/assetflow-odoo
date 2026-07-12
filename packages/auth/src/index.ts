import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@repo/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5001",
  basePath: "/api/v1/auth",
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:5001",
  ],
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
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(`=================================`);
      console.log(`[Better Auth] Password Reset Requested for: ${user.email}`);
      console.log(`[Better Auth] Reset Token: ${token}`);
      console.log(`[Better Auth] Reset URL: ${url}`);
      console.log(`=================================`);
    },
  },
});

export type Auth = typeof auth;
