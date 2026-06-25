import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload, UserRole } from '@/types/auth.types'

// ─── Constantes de cookies ──────────────────────────────────────────────────

export const COOKIE_ACCESS = 'lfit_access'
export const COOKIE_REFRESH = 'lfit_refresh'

export const COOKIE_ACCESS_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 15, // 15 minutos
  path: '/',
}

export const COOKIE_REFRESH_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: '/',
}

// ─── Segredos JWT (TextEncoder para compatibilidade com Edge Runtime) ────────

function getAccessSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

function getRefreshSecret() {
  return new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)
}

// ─── Password ────────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

type TokenPayload = { sub: string; email: string; role: UserRole }

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getAccessSecret())
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getRefreshSecret())
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
