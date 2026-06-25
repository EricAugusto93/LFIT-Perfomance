import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations/auth.schema'
import {
  comparePassword,
  signAccessToken,
  signRefreshToken,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_ACCESS_OPTIONS,
  COOKIE_REFRESH_OPTIONS,
} from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.passwordHash)

    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
    }

    const tokenPayload = { sub: user.id, email: user.email, role: 'trainer' as const }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ])

    const response = NextResponse.json(
      { data: { user: { id: user.id, name: user.name, email: user.email } } },
      { status: 200 }
    )

    response.cookies.set(COOKIE_ACCESS, accessToken, COOKIE_ACCESS_OPTIONS)
    response.cookies.set(COOKIE_REFRESH, refreshToken, COOKIE_REFRESH_OPTIONS)

    // Gera notificações em background (sem bloquear o login)
    import('@/services/notification.service')
      .then(({ generateNotifications }) => generateNotifications(user.id))
      .catch(() => {})

    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
