import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTrainerSession } from '@/lib/session'
import { updateGoal, markGoalAsAchieved, deleteGoal } from '@/services/goal.service'

const GOAL_TYPES = ['WEIGHT', 'BODY_FAT', 'MUSCLE_MASS', 'CIRCUMFERENCE'] as const

const updateGoalSchema = z.object({
  type: z.enum(GOAL_TYPES).optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().optional(),
  deadline: z.string().datetime().nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = updateGoalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const goal = await updateGoal(id, session.sub, parsed.data)
    return NextResponse.json({ data: goal })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const goal = await markGoalAsAchieved(id, session.sub)
    return NextResponse.json({ data: goal })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await deleteGoal(id, session.sub)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
