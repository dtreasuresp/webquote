import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Resolución priorizada de variables (Vercel Storage / local)
const resolvedUrl =
  process.env.DATABASE_URL ||
  process.env.STORAGE_POSTGRES_PRISMA_URL ||
  process.env.STORAGE_DATABASE_URL_UNPOOLED ||
  process.env.STORAGE_POSTGRES_URL_NON_POOLING ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_DATABASE_URL;

// Durante el build de Next.js, puede no haber DATABASE_URL
// No lanzamos error para permitir que el build complete
const createPrismaClient = () => {
  if (!resolvedUrl) {
    console.warn('[Prisma] No DATABASE_URL found - using dummy connection for build')
    // Retornamos un cliente con URL placeholder que fallará en runtime si se usa
    return new PrismaClient({
      log: [],
      datasources: {
        db: { url: 'postgresql://placeholder:placeholder@localhost:5432/placeholder' }
      }
    })
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['error', 'warn'],
    datasources: {
      db: { url: resolvedUrl }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
