import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { markAllAsRead } from '@/services/notification.service'

export async function PATCH(_request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    await markAllAsRead(session.sub)
    return NextResponse.json({ data: { ok: true } })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
