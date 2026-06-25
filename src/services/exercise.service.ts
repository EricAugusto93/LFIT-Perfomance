import * as repo from '@/repositories/exercise.repository'
import type { CreateExerciseInput, UpdateExerciseInput } from '@/lib/validations/exercise.schema'
import type { MuscleGroup } from '@/generated/prisma'

export async function listExercises(trainerId: string, filters?: { muscleGroup?: MuscleGroup; search?: string }) {
  return repo.findMany(trainerId, filters)
}

export async function createExercise(trainerId: string, data: CreateExerciseInput) {
  return repo.create(trainerId, {
    trainerId,
    name: data.name,
    muscleGroup: data.muscleGroup,
    imageUrl: data.imageUrl || null,
    videoUrl: data.videoUrl || null,
    equipment: data.equipment || null,
    difficultyLevel: data.difficultyLevel ?? null,
  })
}

export async function updateExercise(id: string, trainerId: string, data: UpdateExerciseInput) {
  const exercise = await repo.findById(id)
  if (!exercise) throw new Error('NOT_FOUND')
  if (exercise.trainerId !== trainerId) throw new Error('FORBIDDEN')

  return repo.update(id, {
    ...(data.name && { name: data.name }),
    ...(data.muscleGroup && { muscleGroup: data.muscleGroup }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
    ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
    ...(data.equipment !== undefined && { equipment: data.equipment || null }),
    ...(data.difficultyLevel !== undefined && { difficultyLevel: data.difficultyLevel ?? null }),
  })
}

export async function deleteExercise(id: string, trainerId: string) {
  const exercise = await repo.findById(id)
  if (!exercise) throw new Error('NOT_FOUND')
  if (exercise.trainerId !== trainerId) throw new Error('FORBIDDEN')
  return repo.remove(id)
}
