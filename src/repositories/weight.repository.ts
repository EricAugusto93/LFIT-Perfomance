import { prisma } from '@/lib/prisma'

export async function findByStudent(studentId: string) {
  return prisma.weightRecord.findMany({
    where: { studentId },
    orderBy: { recordedAt: 'asc' },
  })
}

export async function create(studentId: string, weight: number, recordedAt?: Date) {
  return prisma.weightRecord.create({
    data: {
      studentId,
      weight,
      recordedAt: recordedAt ?? new Date(),
    },
  })
}
