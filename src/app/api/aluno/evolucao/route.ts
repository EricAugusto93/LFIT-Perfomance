import { NextResponse } from 'next/server'
import { requireStudentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(d))

export async function GET() {
  try {
    const session = await requireStudentSession()
    const studentId = session.sub

    const [evaluations, weightRecords] = await Promise.all([
      prisma.physicalEvaluation.findMany({
        where: { studentId },
        orderBy: { date: 'asc' },
        select: { date: true, weight: true, bmi: true, bodyFatPercentage: true, muscleMass: true },
      }),
      prisma.weightRecord.findMany({
        where: { studentId },
        orderBy: { recordedAt: 'asc' },
        select: { weight: true, recordedAt: true },
      }),
    ])

    // Combina os dois em um array de pontos para o gráfico
    const evalPoints = evaluations.map((e) => ({
      date: fmtDate(e.date),
      dateISO: new Date(e.date).toISOString(),
      weight: e.weight,
      bmi: e.bmi,
      source: 'evaluation' as const,
    }))

    const weightPoints = weightRecords.map((w) => ({
      date: fmtDate(w.recordedAt),
      dateISO: new Date(w.recordedAt).toISOString(),
      weight: w.weight,
      bmi: null,
      source: 'self' as const,
    }))

    // Mescla e ordena por data
    const combined = [...evalPoints, ...weightPoints].sort(
      (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    const lastEval = evaluations[evaluations.length - 1]
    const lastWeight = weightRecords[weightRecords.length - 1]

    return NextResponse.json({
      data: {
        chartPoints: combined,
        currentWeight: lastWeight?.weight ?? lastEval?.weight ?? null,
        lastEvaluation: lastEval
          ? {
              date: fmtDate(lastEval.date),
              bodyFatPercentage: lastEval.bodyFatPercentage,
              muscleMass: lastEval.muscleMass,
            }
          : null,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
}
