import { cookies } from 'next/headers'
import { verifyAccessToken, COOKIE_ACCESS } from '@/lib/auth'
import type { JWTPayload } from '@/types/auth.types'

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_ACCESS)?.value
  if (!token) return null
  return verifyAccessToken(token)
}

export async function requireTrainerSession(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session || session.role !== 'trainer') {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

export async function requireStudentSession(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session || session.role !== 'student') {
    throw new Error('UNAUTHORIZED')
  }
  return session
}
