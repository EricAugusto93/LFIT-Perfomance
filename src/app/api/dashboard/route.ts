import { NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { getDashboardData } from '@/services/dashboard.service'
import { withRetry } from '@/lib/with-retry'

export async function GET() {
  try {
    const session = await requireTrainerSession()
    const data = await withRetry(() => getDashboardData(session.sub))
    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
