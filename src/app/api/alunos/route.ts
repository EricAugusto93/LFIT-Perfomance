import { NextRequest, NextResponse } from 'next/server'
import { requireTrainerSession } from '@/lib/session'
import { listStudents, createStudent } from '@/services/student.service'
import { createStudentSchema } from '@/lib/validations/student.schema'
import type { StudentStatus } from '@/generated/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') as StudentStatus | null
    const search = searchParams.get('search') ?? undefined

    const students = await listStudents(session.sub, {
      ...(status && { status }),
      search,
    })

    return NextResponse.json({ data: students })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTrainerSession()
    const body = await request.json()
    const parsed = createStudentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const student = await createStudent(session.sub, parsed.data)
    return NextResponse.json({ data: student }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
