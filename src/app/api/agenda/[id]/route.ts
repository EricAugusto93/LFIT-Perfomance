import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTrainerSession } from '@/lib/session'
import { updateEvent, deleteEvent } from '@/services/schedule.service'

const SCHEDULE_EVENT_TYPES = ['EVALUATION', 'WORKOUT_RENEWAL', 'CONSULTATION', 'AVAILABILITY'] as const

const updateEventSchema = z.object({
  type: z.enum(SCHEDULE_EVENT_TYPES).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  studentId: z.string().nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = updateEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const event = await updateEvent(id, session.sub, parsed.data)
    return NextResponse.json({ data: event })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await deleteEvent(id, session.sub)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
