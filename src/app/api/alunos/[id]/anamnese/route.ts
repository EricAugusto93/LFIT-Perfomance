import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireTrainerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const anamnesisSchema = z.object({
  mainObjective: z.string().optional(),
  weightTrainingExperience: z.string().optional(),
  weeklyFrequency: z.number().int().min(1).max(7).optional(),
  healthIssues: z.string().optional(),
  injuries: z.string().optional(),
  previousSurgeries: z.string().optional(),
  medications: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  sleepHours: z.number().int().min(1).max(24).optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
})

type Params = { params: Promise<{ id: string }> }

async function verifyStudentOwnership(studentId: string, trainerId: string) {
  const student = await prisma.student.findFirst({ where: { id: studentId, trainerId } })
  if (!student) throw new Error('NOT_FOUND')
  return student
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await verifyStudentOwnership(id, session.sub)

    const anamnesis = await prisma.anamnesis.findUnique({ where: { studentId: id } })
    return NextResponse.json({ data: anamnesis })
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
    await verifyStudentOwnership(id, session.sub)

    const body = await request.json()
    const parsed = anamnesisSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const anamnesis = await prisma.anamnesis.create({
      data: { studentId: id, ...parsed.data },
    })
    return NextResponse.json({ data: anamnesis }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await requireTrainerSession()
    const { id } = await params
    await verifyStudentOwnership(id, session.sub)

    const body = await request.json()
    const parsed = anamnesisSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const anamnesis = await prisma.anamnesis.upsert({
      where: { studentId: id },
      create: { studentId: id, ...parsed.data },
      update: parsed.data,
    })
    return NextResponse.json({ data: anamnesis })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
