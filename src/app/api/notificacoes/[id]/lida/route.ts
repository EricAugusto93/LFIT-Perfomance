import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { markAsRead } from '@/services/notification.service'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await markAsRead(id, session.sub)
    return NextResponse.json({ data: { ok: true } })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
