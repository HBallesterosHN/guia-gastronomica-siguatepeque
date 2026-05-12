import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * En desarrollo, `globalThis.prisma` puede quedar apuntando a un cliente generado **antes** de
 * añadir modelos nuevos; ese objeto no tiene delegados como `.guide` y rompe con
 * "Cannot read properties of undefined (reading 'findMany')". Si falta el delegado, recreamos.
 */
function getPrisma(): PrismaClient {
  const existing = globalForPrisma.prisma;
  if (existing) {
    const d = existing as unknown as {
      guide?: { findMany?: unknown };
      guideRestaurant?: { findMany?: unknown };
    };
    if (
      typeof d.guide?.findMany === "function" &&
      typeof d.guideRestaurant?.findMany === "function"
    ) {
      return existing;
    }
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
