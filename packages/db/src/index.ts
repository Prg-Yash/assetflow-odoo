import { PrismaClient } from "../generated/prisma/index.js";

export const db = new PrismaClient();
export * from "../generated/prisma/index.js";
