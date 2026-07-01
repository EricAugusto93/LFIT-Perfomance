import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTrainerSession } from '@/lib/session'
import { getMonthEvents, createEvent } from '@/services/schedule.service'
import { withRetry } from '@/lib/with-retry'

const SCHEDULE_EVENT_TYPES = ['EVALUATION', 'WORKOUT_RENEWAL', 'CONSULTATION', 'AVAILABILITY'] as const

const createEventSchema = z.object({
  type: z.enum(SCHEDULE_EVENT_TYPES),
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  studentId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const { searchParams } = request.nextUrl
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

    const events = await withRetry(() => getMonthEvents(session.sub, year, month))
    return NextResponse.json({ data: events })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const body = await request.json()
    const parsed = createEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const event = await createEvent(session.sub, parsed.data)
    return NextResponse.json({ data: event }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
