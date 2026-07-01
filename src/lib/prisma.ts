import { PrismaClient } from '@/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    // Serverless-optimized pool: 1 conexão por Lambda evita esgotamento do pool
    max: 1,
    // Timeout de conexão: 8s para cobrir cold start do Supabase pooler
    connectionTimeoutMillis: 8000,
    // Manter conexão viva por 60s entre invocações warm
    idleTimeoutMillis: 60000,
  })
  return new PrismaClient({ adapter })
}

// Cacheia globalmente — warm Lambda invocations reutilizam a conexão existente
export const prisma = globalForPrisma.prisma ?? createPrismaClient()
globalForPrisma.prisma = prisma
