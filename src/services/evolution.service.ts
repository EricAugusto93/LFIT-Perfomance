import * as repo from '@/repositories/evaluation.repository'
import * as studentRepo from '@/repositories/student.repository'
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS } from '@/lib/validations/evaluation.schema'
import type { MeasurementsInput } from '@/lib/validations/evaluation.schema'

export type EvolutionIndicator = 'EVOLVING' | 'STABLE' | 'REGRESSION'

export type ChartPoint = {
  date: string       // 'dd/MM/yy' — usado no eixo X dos gráficos
  dateISO: string    // ISO — para ordenação e tooltips
  weight: number | null
  bmi: number | null
  bodyFat: number | null
  muscleMass: number | null
  leanMass: number | null
}

export type MeasurementPoint = {
  date: string
  dateISO: string
} & Partial<Record<keyof MeasurementsInput, number | null>>

export type EvolutionData = {
  indicator: EvolutionIndicator
  chartPoints: ChartPoint[]
  measurementPoints: MeasurementPoint[]
  summary: {
    evaluationCount: number
    weightChange: number | null
    bodyFatChange: number | null
    muscleMassChange: number | null
    firstDate: string | null
    lastDate: string | null
  }
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  }).format(new Date(date))
}

function calcIndicator(
  curr: { weight?: number | null; bodyFatPercentage?: number | null; muscleMass?: number | null },
  prev: { weight?: number | null; bodyFatPercentage?: number | null; muscleMass?: number | null }
): EvolutionIndicator {
  const THRESHOLD = 0.5

  const weightImproved = curr.weight != null && prev.weight != null
    ? prev.weight - curr.weight > THRESHOLD : null
  const fatImproved = curr.bodyFatPercentage != null && prev.bodyFatPercentage != null
    ? prev.bodyFatPercentage - curr.bodyFatPercentage > THRESHOLD : null
  const muscleImproved = curr.muscleMass != null && prev.muscleMass != null
    ? curr.muscleMass - prev.muscleMass > THRESHOLD : null

  const metrics = [weightImproved, fatImproved, muscleImproved].filter((m) => m !== null)
  if (metrics.length === 0) return 'STABLE'

  const improved = metrics.filter(Boolean).length
  const worsened = metrics.filter((m) => m === false).length

  if (improved > 0 && worsened === 0) return 'EVOLVING'
  if (worsened > 0 && improved === 0) return 'REGRESSION'
  if (improved >= worsened) return 'EVOLVING'
  return 'STABLE'
}

function numDiff(curr?: number | null, first?: number | null) {
  if (curr == null || first == null) return null
  return parseFloat((curr - first).toFixed(2))
}

export async function getEvolutionData(studentId: string, trainerId: string): Promise<EvolutionData> {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')

  const evaluations = await repo.findByStudent(studentId)

  // Ordena do mais antigo para o mais recente para os gráficos
  const sorted = [...evaluations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const chartPoints: ChartPoint[] = sorted.map((ev) => ({
    date: fmtDate(ev.date),
    dateISO: new Date(ev.date).toISOString(),
    weight: ev.weight ?? null,
    bmi: ev.bmi ?? null,
    bodyFat: ev.bodyFatPercentage ?? null,
    muscleMass: ev.muscleMass ?? null,
    leanMass: ev.leanMass ?? null,
  }))

  const measurementPoints: MeasurementPoint[] = sorted.map((ev) => ({
    date: fmtDate(ev.date),
    dateISO: new Date(ev.date).toISOString(),
    ...Object.fromEntries(
      MEASUREMENT_KEYS.map((key) => [key, ev.measurements?.[key as keyof MeasurementsInput] ?? null])
    ),
  }))

  // Indicador baseado nas 2 últimas avaliações
  const latest = evaluations[0]
  const previous = evaluations[1]
  const indicator = latest && previous
    ? calcIndicator(latest, previous)
    : 'STABLE'

  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  return {
    indicator,
    chartPoints,
    measurementPoints,
    summary: {
      evaluationCount: evaluations.length,
      weightChange: numDiff(last?.weight, first?.weight),
      bodyFatChange: numDiff(last?.bodyFatPercentage, first?.bodyFatPercentage),
      muscleMassChange: numDiff(last?.muscleMass, first?.muscleMass),
      firstDate: first ? fmtDate(first.date) : null,
      lastDate: last ? fmtDate(last.date) : null,
    },
  }
}
