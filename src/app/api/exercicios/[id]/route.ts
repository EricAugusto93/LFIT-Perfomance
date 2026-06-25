import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { updateExercise, deleteExercise } from '@/services/exercise.service'
import { updateExerciseSchema } from '@/lib/validations/exercise.schema'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = updateExerciseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const exercise = await updateExercise(id, session.sub, parsed.data)
    return NextResponse.json({ data: exercise })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Sem permissão para editar este exercício' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await deleteExercise(id, session.sub)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Sem permissão para excluir este exercício' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
