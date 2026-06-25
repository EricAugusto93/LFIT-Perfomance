import { NextRequest, NextResponse } from 'next/server'
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_ACCESS_OPTIONS,
} from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/aluno/login']
const API_AUTH_PREFIX = '/api/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Libera rotas públicas e endpoints de auth
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith(API_AUTH_PREFIX)
  ) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(COOKIE_ACCESS)?.value
  const refreshToken = request.cookies.get(COOKIE_REFRESH)?.value

  // Tenta validar o access token
  let payload = accessToken ? await verifyAccessToken(accessToken) : null

  // Access token inválido/expirado — tenta renovar via refresh token
  if (!payload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken)

    if (refreshPayload) {
      const newAccessToken = await signAccessToken({
        sub: refreshPayload.sub,
        email: refreshPayload.email,
        role: refreshPayload.role,
      })

      payload = refreshPayload

      // Redireciona usuário já autenticado para fora de páginas públicas
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        const dest = refreshPayload.role === 'student' ? '/aluno/treino' : '/dashboard'
        const res = NextResponse.redirect(new URL(dest, request.url))
        res.cookies.set(COOKIE_ACCESS, newAccessToken, COOKIE_ACCESS_OPTIONS)
        return res
      }

      // Renova o cookie silenciosamente e continua
      const res = NextResponse.next()
      res.cookies.set(COOKIE_ACCESS, newAccessToken, COOKIE_ACCESS_OPTIONS)
      return res
    }
  }

  // Autenticado — controle de acesso por role
  if (payload) {
    const isStudentArea = pathname.startsWith('/aluno')
    const isTrainerArea = !isStudentArea && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))

    if (isStudentArea && payload.role !== 'student') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isTrainerArea && payload.role === 'student') {
      return NextResponse.redirect(new URL('/aluno/treino', request.url))
    }

    return NextResponse.next()
  }

  // Não autenticado
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const isStudentPath = pathname.startsWith('/aluno')
  const loginUrl = new URL(isStudentPath ? '/aluno/login' : '/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
