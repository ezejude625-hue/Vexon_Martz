// ============================================================
// PRISMA CLIENT — src/lib/prisma.js
// ============================================================
import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ── paginate() ────────────────────────────────────────────────
export async function paginate(model, options = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    model.count({ where: options.where }),
    model.findMany({ ...options, skip, take: limit }),
  ]);
  return { data, total };
}

// ── buildPagination() ─────────────────────────────────────────
export function buildPagination(total, page, limit) {
  const total_pages = Math.ceil(total / limit);
  return { page, limit, total, total_pages, has_next: page < total_pages, has_prev: page > 1 };
}

// ── serialize() ───────────────────────────────────────────────
export function serialize(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "object" && value !== null && value.constructor?.name === "Decimal")
        return parseFloat(value.toString());
      if (typeof value === "bigint") return Number(value);
      return value;
    }),
  );
}

export default prisma;
