import { NextRequest, NextResponse } from 'next/server'
import { requireStudentSession } from '@/lib/session'
import { z } from 'zod'
import * as loadRepo from '@/repositories/load.repository'

const schema = z.object({
  workoutExerciseId: z.string().min(1),
  load: z.coerce.number().positive('Informe uma carga válida'),
  reps: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireStudentSession()
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const record = await loadRepo.create({
      studentId: session.sub,
      ...parsed.data,
    })

    return NextResponse.json({ data: record }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
}
