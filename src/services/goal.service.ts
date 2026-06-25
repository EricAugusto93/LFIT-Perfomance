import * as repo from '@/repositories/goal.repository'
import * as studentRepo from '@/repositories/student.repository'
import type { GoalType } from '@/generated/prisma'

export async function listGoals(studentId: string, trainerId: string) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return repo.findByStudent(studentId, trainerId)
}

export async function createGoal(
  studentId: string,
  trainerId: string,
  data: { type: GoalType; targetValue: number; currentValue?: number; deadline?: string }
) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return repo.create({
    studentId,
    trainerId,
    type: data.type,
    targetValue: data.targetValue,
    currentValue: data.currentValue,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
  })
}

export async function updateGoal(
  id: string,
  trainerId: string,
  data: { type?: GoalType; targetValue?: number; currentValue?: number; deadline?: string | null }
) {
  const goal = await repo.findById(id, trainerId)
  if (!goal) throw new Error('NOT_FOUND')
  return repo.update(id, {
    type: data.type,
    targetValue: data.targetValue,
    currentValue: data.currentValue,
    deadline: data.deadline === null ? null : data.deadline ? new Date(data.deadline) : undefined,
  })
}

export async function markGoalAsAchieved(id: string, trainerId: string) {
  const goal = await repo.findById(id, trainerId)
  if (!goal) throw new Error('NOT_FOUND')
  return repo.markAsAchieved(id)
}

export async function deleteGoal(id: string, trainerId: string) {
  const goal = await repo.findById(id, trainerId)
  if (!goal) throw new Error('NOT_FOUND')
  await repo.remove(id, trainerId)
}
