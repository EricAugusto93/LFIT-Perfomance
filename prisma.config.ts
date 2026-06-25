import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Carrega .env.local primeiro (Next.js), depois .env como fallback (Prisma CLI)
config({ path: '.env.local' })
config({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
})
