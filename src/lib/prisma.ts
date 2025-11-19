import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Resolución priorizada de variables (Vercel Storage / local)
const resolvedUrl =
  process.env.DATABASE_URL ||
  process.env.STORAGE_POSTGRES_PRISMA_URL ||
  process.env.STORAGE_DATABASE_URL_UNPOOLED ||
  process.env.STORAGE_POSTGRES_URL_NON_POOLING ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_DATABASE_URL;

if (!resolvedUrl) {
  throw new Error('No se encontró ninguna variable de conexión PostgreSQL (DATABASE_URL / STORAGE_*).')
}

// Debug logging intentionally removed to avoid sensitive output in dev.
// If further diagnostics are needed, enable this in a local branch only.

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: { url: resolvedUrl }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
