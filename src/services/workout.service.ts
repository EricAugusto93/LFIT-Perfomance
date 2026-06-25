import * as repo from '@/repositories/workout.repository'
import * as studentRepo from '@/repositories/student.repository'
import type { CreateWorkoutInput, UpdateWorkoutInput } from '@/lib/validations/workout.schema'

export async function listWorkouts(studentId: string, trainerId: string) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')
  return repo.findByStudent(studentId, trainerId)
}

export async function getWorkout(id: string, trainerId: string) {
  const workout = await repo.findById(id)
  if (!workout || workout.trainerId !== trainerId) throw new Error('NOT_FOUND')
  return workout
}

export async function createWorkout(
  trainerId: string,
  studentId: string,
  data: CreateWorkoutInput
) {
  const student = await studentRepo.findById(studentId, trainerId)
  if (!student) throw new Error('NOT_FOUND')

  const exercises = data.exercises.map((ex, i) => ({ ...ex, order: i + 1 }))
  return repo.create(trainerId, studentId, data, exercises)
}

export async function updateWorkout(id: string, trainerId: string, data: UpdateWorkoutInput) {
  const workout = await repo.findById(id)
  if (!workout || workout.trainerId !== trainerId) throw new Error('NOT_FOUND')

  const exercises = data.exercises?.map((ex, i) => ({ ...ex, order: i + 1 }))
  return repo.update(id, data, exercises)
}

export async function duplicateWorkout(id: string, trainerId: string) {
  const workout = await repo.findById(id)
  if (!workout || workout.trainerId !== trainerId) throw new Error('NOT_FOUND')
  return repo.duplicate(id, trainerId, workout.student.id)
}

export async function deactivateWorkout(id: string, trainerId: string) {
  const workout = await repo.findById(id)
  if (!workout || workout.trainerId !== trainerId) throw new Error('NOT_FOUND')
  return repo.deactivate(id)
}
