import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTrainerSession } from '@/lib/session'
import { listGoals, createGoal } from '@/services/goal.service'

const GOAL_TYPES = ['WEIGHT', 'BODY_FAT', 'MUSCLE_MASS', 'CIRCUMFERENCE'] as const

const createGoalSchema = z.object({
  type: z.enum(GOAL_TYPES),
  targetValue: z.number().positive(),
  currentValue: z.number().optional(),
  deadline: z.string().datetime().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const goals = await listGoals(id, session.sub)
    return NextResponse.json({ data: goals })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = createGoalSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const goal = await createGoal(id, session.sub, parsed.data)
    return NextResponse.json({ data: goal }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
