import { NextResponse } from 'next/server'
import { COOKIE_ACCESS, COOKIE_REFRESH } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ data: { ok: true } })
  response.cookies.delete(COOKIE_ACCESS)
  response.cookies.delete(COOKIE_REFRESH)
  return response
}
