import { NextRequest, NextResponse } from 'next/server'
import { requireStudentSession } from '@/lib/session'
import { z } from 'zod'
import * as weightRepo from '@/repositories/weight.repository'

const schema = z.object({
  weight: z.coerce.number().positive('Peso inválido'),
  date: z.string().optional(),
})

export async function GET() {
  try {
    const session = await requireStudentSession()
    const records = await weightRepo.findByStudent(session.sub)
    return NextResponse.json({ data: records })
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireStudentSession()
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const recordedAt = parsed.data.date ? new Date(parsed.data.date) : new Date()
    const record = await weightRepo.create(session.sub, parsed.data.weight, recordedAt)

    return NextResponse.json({ data: record }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
}
