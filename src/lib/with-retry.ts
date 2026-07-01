/**
 * Executa uma função async com retry automático.
 * Cobre cold start da pool Prisma/Supabase em serverless.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 400
): Promise<T> {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === attempts) throw err
      await new Promise((r) => setTimeout(r, delayMs * i))
    }
  }
  throw new Error('unreachable')
}
