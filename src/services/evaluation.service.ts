import * as repo from '@/repositories/evaluation.repository'
import * as studentRepo from '@/repositories/student.repository'
import { calcBMI } from '@/lib/validations/evaluation.schema'
import type { CreateEvaluationInput, UpdateEvaluationInput } from '@/lib/validations/evaluation.schema'

export async function listEvaluations(studentId: string, trainerId: string) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return repo.findByStudent(studentId)
}

export async function getEvaluation(id: string, trainerId: string) {
  const evaluation = await repo.findById(id)
  if (!evaluation || evaluation.trainerId !== trainerId) throw new Error('NOT_FOUND')

  // Busca avaliação anterior para comparação
  const history = await repo.findLatestByStudent(evaluation.studentId, 10)
  const currentIndex = history.findIndex((e) => e.id === id)
  const previous = currentIndex < history.length - 1 ? history[currentIndex + 1] : null

  return { evaluation, previous, comparison: previous ? buildComparison(evaluation, previous) : null }
}

export async function createEvaluation(
  studentId: string,
  trainerId: string,
  data: CreateEvaluationInput
) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')

  const bmi = calcBMI(data.weight, data.height)
  return repo.create(studentId, trainerId, data, bmi)
}

export async function updateEvaluation(
  id: string,
  trainerId: string,
  data: UpdateEvaluationInput
) {
  const evaluation = await repo.findById(id)
  if (!evaluation || evaluation.trainerId !== trainerId) throw new Error('NOT_FOUND')

  const weight = data.weight ?? evaluation.weight ?? undefined
  const height = data.height ?? evaluation.height ?? undefined
  const bmi = calcBMI(weight, height)

  return repo.update(id, data, bmi)
}

// ─── Comparação ──────────────────────────────────────────────────────────────

type EvalWithDetails = NonNullable<Awaited<ReturnType<typeof repo.findById>>>

function diff(current?: number | null, previous?: number | null) {
  if (current == null || previous == null) return null
  return parseFloat((current - previous).toFixed(2))
}

function buildComparison(current: EvalWithDetails, previous: EvalWithDetails) {
  return {
    weightDiff: diff(current.weight, previous.weight),
    bodyFatDiff: diff(current.bodyFatPercentage, previous.bodyFatPercentage),
    muscleMassDiff: diff(current.muscleMass, previous.muscleMass),
    leanMassDiff: diff(current.leanMass, previous.leanMass),
    bmiDiff: diff(current.bmi, previous.bmi),
    measurements: current.measurements && previous.measurements
      ? {
          shoulderDiff: diff(current.measurements.shoulder, previous.measurements.shoulder),
          chestDiff: diff(current.measurements.chest, previous.measurements.chest),
          waistDiff: diff(current.measurements.waist, previous.measurements.waist),
          abdomenDiff: diff(current.measurements.abdomen, previous.measurements.abdomen),
          hipDiff: diff(current.measurements.hip, previous.measurements.hip),
          rightArmDiff: diff(current.measurements.rightArm, previous.measurements.rightArm),
          leftArmDiff: diff(current.measurements.leftArm, previous.measurements.leftArm),
          rightThighDiff: diff(current.measurements.rightThigh, previous.measurements.rightThigh),
          leftThighDiff: diff(current.measurements.leftThigh, previous.measurements.leftThigh),
          rightCalfDiff: diff(current.measurements.rightCalf, previous.measurements.rightCalf),
          leftCalfDiff: diff(current.measurements.leftCalf, previous.measurements.leftCalf),
        }
      : null,
    previousDate: previous.date,
  }
}

export type EvaluationComparison = ReturnType<typeof buildComparison>
