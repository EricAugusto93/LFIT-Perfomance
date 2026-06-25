import { prisma } from '@/lib/prisma'
import type { WorkoutExerciseInput } from '@/lib/validations/workout.schema'

const WITH_EXERCISES = {
  exercises: {
    include: { exercise: true },
    orderBy: { order: 'asc' as const },
  },
}

export async function findByStudent(studentId: string, trainerId: string) {
  return prisma.workout.findMany({
    where: { studentId, trainerId },
    include: WITH_EXERCISES,
    orderBy: [{ isActive: 'desc' }, { division: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function findById(id: string) {
  return prisma.workout.findUnique({
    where: { id },
    include: {
      ...WITH_EXERCISES,
      history: { orderBy: { createdAt: 'desc' }, take: 20 },
      student: { select: { id: true, name: true } },
    },
  })
}

export async function findExpiredWorkouts(trainerId: string) {
  return prisma.workout.findMany({
    where: { trainerId, isActive: true, expiresAt: { lt: new Date() } },
    select: {
      id: true,
      name: true,
      division: true,
      expiresAt: true,
      student: { select: { id: true, name: true } },
    },
    orderBy: { expiresAt: 'asc' },
  })
}

export async function create(
  trainerId: string,
  studentId: string,
  data: { name: string; division: string; description?: string; expiresAt?: string },
  exercises: WorkoutExerciseInput[]
) {
  return prisma.workout.create({
    data: {
      trainerId,
      studentId,
      name: data.name,
      division: data.division as never,
      description: data.description || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      exercises: {
        create: exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime ?? null,
          load: ex.load ?? null,
          observations: ex.observations || null,
          order: ex.order,
        })),
      },
    },
    include: WITH_EXERCISES,
  })
}

export async function update(
  id: string,
  data: { name?: string; division?: string; description?: string; expiresAt?: string },
  exercises?: WorkoutExerciseInput[]
) {
  // Salva snapshot antes de atualizar
  const current = await findById(id)

  await prisma.$transaction(async (tx) => {
    await tx.workout.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.division && { division: data.division as never }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
      },
    })

    if (exercises) {
      await tx.workoutExercise.deleteMany({ where: { workoutId: id } })
      await tx.workoutExercise.createMany({
        data: exercises.map((ex) => ({
          workoutId: id,
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime ?? null,
          load: ex.load ?? null,
          observations: ex.observations || null,
          order: ex.order,
        })),
      })
    }

    if (current) {
      await tx.workoutHistory.create({
        data: {
          workoutId: id,
          trainerId: current.trainerId,
          description: 'Treino atualizado',
          snapshot: JSON.parse(JSON.stringify(current)),
        },
      })
    }
  })

  return findById(id)
}

export async function duplicate(id: string, trainerId: string, studentId: string) {
  const source = await findById(id)
  if (!source) throw new Error('NOT_FOUND')

  return prisma.workout.create({
    data: {
      trainerId,
      studentId,
      name: `${source.name} (cópia)`,
      division: source.division,
      description: source.description,
      expiresAt: null,
      exercises: {
        create: source.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          load: ex.load,
          observations: ex.observations,
          order: ex.order,
        })),
      },
    },
    include: WITH_EXERCISES,
  })
}

export async function deactivate(id: string) {
  return prisma.workout.update({ where: { id }, data: { isActive: false } })
}
