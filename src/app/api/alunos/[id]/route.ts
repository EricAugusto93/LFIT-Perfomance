import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { getStudent, updateStudent } from '@/services/student.service'
import { updateStudentSchema } from '@/lib/validations/student.schema'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const student = await getStudent(id, session.sub)
    return NextResponse.json({ data: student })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      }
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
      }
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = updateStudentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const student = await updateStudent(id, session.sub, parsed.data)
    return NextResponse.json({ data: student })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      }
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
      }
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
