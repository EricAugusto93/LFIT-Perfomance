import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { listExercises, createExercise } from '@/services/exercise.service'
import { createExerciseSchema } from '@/lib/validations/exercise.schema'
import type { MuscleGroup } from '@/generated/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const { searchParams } = request.nextUrl
    const muscleGroup = searchParams.get('muscleGroup') as MuscleGroup | null
    const search = searchParams.get('search') ?? undefined

    const exercises = await listExercises(session.sub, {
      ...(muscleGroup && { muscleGroup }),
      search,
    })

    return NextResponse.json({ data: exercises })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const body = await request.json()
    const parsed = createExerciseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const exercise = await createExercise(session.sub, parsed.data)
    return NextResponse.json({ data: exercise }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
