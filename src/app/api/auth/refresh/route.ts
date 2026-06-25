import { NextRequest, NextResponse } from 'next/server'
import {
  verifyRefreshToken,
  signAccessToken,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_ACCESS_OPTIONS,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIE_REFRESH)?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh token ausente' }, { status: 401 })
  }

  const payload = await verifyRefreshToken(refreshToken)

  if (!payload) {
    return NextResponse.json({ error: 'Refresh token inválido ou expirado' }, { status: 401 })
  }

  const newAccessToken = await signAccessToken({
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  })

  const response = NextResponse.json({ data: { ok: true } })
  response.cookies.set(COOKIE_ACCESS, newAccessToken, COOKIE_ACCESS_OPTIONS)

  return response
}
