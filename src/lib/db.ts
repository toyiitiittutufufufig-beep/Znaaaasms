import { PrismaClient } from "@prisma/client";
import { config } from "@/config";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  g.prisma ?? new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });
if (process.env.NODE_ENV !== "production") g.prisma = db;

export class AppError extends Error {
  constructor(public code: string) { super(code); }
}
export const fmt = (v: bigint) => Number(v) / 1e6; // micro-units -> رقم عادي
