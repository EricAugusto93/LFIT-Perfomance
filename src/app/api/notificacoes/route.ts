import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { listNotifications, getUnreadCount } from '@/services/notification.service'

export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const onlyCount = request.nextUrl.searchParams.get('count') === 'true'

    if (onlyCount) {
      const count = await getUnreadCount(session.sub)
      return NextResponse.json({ data: { count } })
    }

    const notifications = await listNotifications(session.sub)
    return NextResponse.json({ data: notifications })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
