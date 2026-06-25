import { prisma } from '@/lib/prisma'
import type { StudentStatus, Prisma } from '@/generated/prisma'

export async function findMany(
  trainerId: string,
  filters?: { status?: StudentStatus; search?: string }
) {
  return prisma.student.findMany({
    where: {
      trainerId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        name: { contains: filters.search, mode: 'insensitive' },
      }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findById(id: string, trainerId: string) {
  return prisma.student.findFirst({
    where: { id, trainerId },
    include: {
      evaluations: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { id: true, date: true, weight: true, bodyFatPercentage: true },
      },
      workouts: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, name: true, division: true, expiresAt: true },
      },
    },
  })
}

export async function create(trainerId: string, data: Prisma.StudentUncheckedCreateInput) {
  return prisma.student.create({ data: { ...data, trainerId } })
}

export async function update(id: string, trainerId: string, data: Prisma.StudentUncheckedUpdateInput) {
  return prisma.student.update({ where: { id }, data })
}

export async function updateStatus(id: string, trainerId: string, status: StudentStatus) {
  return prisma.student.update({ where: { id }, data: { status } })
}

export async function countStudentsByStatus(trainerId: string) {
  const [total, active, paused, inactive] = await Promise.all([
    prisma.student.count({ where: { trainerId } }),
    prisma.student.count({ where: { trainerId, status: 'ACTIVE' } }),
    prisma.student.count({ where: { trainerId, status: 'PAUSED' } }),
    prisma.student.count({ where: { trainerId, status: 'INACTIVE' } }),
  ])
  return { total, active, paused, inactive }
}

export async function findStudentsWithExpiredEvaluation(trainerId: string, daysThreshold = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold)

  const students = await prisma.student.findMany({
    where: { trainerId, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      evaluations: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { date: true },
      },
    },
  })

  return students
    .filter((s) => {
      const lastEval = s.evaluations[0]?.date ?? null
      return !lastEval || lastEval < cutoffDate
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      photoUrl: s.photoUrl,
      lastEvaluationDate: s.evaluations[0]?.date ?? null,
    }))
}
