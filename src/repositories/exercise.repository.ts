import { prisma } from '@/lib/prisma'
import type { MuscleGroup, Prisma } from '@/generated/prisma'

export async function findMany(trainerId: string, filters?: { muscleGroup?: MuscleGroup; search?: string }) {
  return prisma.exercise.findMany({
    where: {
      OR: [{ trainerId: null }, { trainerId }],
      ...(filters?.muscleGroup && { muscleGroup: filters.muscleGroup }),
      ...(filters?.search && { name: { contains: filters.search, mode: 'insensitive' } }),
    },
    orderBy: [{ trainerId: 'asc' }, { name: 'asc' }],
  })
}

export async function findById(id: string) {
  return prisma.exercise.findUnique({ where: { id } })
}

export async function create(trainerId: string, data: Prisma.ExerciseUncheckedCreateInput) {
  return prisma.exercise.create({ data: { ...data, trainerId } })
}

export async function update(id: string, data: Prisma.ExerciseUncheckedUpdateInput) {
  return prisma.exercise.update({ where: { id }, data })
}

export async function remove(id: string) {
  return prisma.exercise.delete({ where: { id } })
}
