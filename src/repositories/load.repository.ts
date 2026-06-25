import { prisma } from '@/lib/prisma'

export async function findLastByExercise(studentId: string, workoutExerciseId: string) {
  return prisma.loadRecord.findFirst({
    where: { studentId, workoutExerciseId },
    orderBy: { recordedAt: 'desc' },
  })
}

export async function findByStudent(studentId: string) {
  return prisma.loadRecord.findMany({
    where: { studentId },
    include: { workoutExercise: { include: { exercise: true } } },
    orderBy: { recordedAt: 'desc' },
    take: 50,
  })
}

export async function create(data: {
  studentId: string
  workoutExerciseId: string
  load: number
  reps?: number
  notes?: string
}) {
  return prisma.loadRecord.create({
    data: {
      studentId: data.studentId,
      workoutExerciseId: data.workoutExerciseId,
      load: data.load,
      reps: data.reps ?? null,
      notes: data.notes || null,
      recordedAt: new Date(),
    },
  })
}
