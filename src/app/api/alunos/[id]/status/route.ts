import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { changeStudentStatus } from '@/services/student.service'
import { updateStatusSchema } from '@/lib/validations/student.schema'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    const body = await request.json()
    const parsed = updateStatusSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const student = await changeStudentStatus(id, session.sub, parsed.data.status)
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
