import { NextResponse } from 'next/server'
import { requireStudentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await requireStudentSession()

    const evaluations = await prisma.physicalEvaluation.findMany({
      where: { studentId: session.sub },
      include: { measurements: true },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ data: evaluations })
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
}
