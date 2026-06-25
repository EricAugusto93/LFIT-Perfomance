import { prisma } from '@/lib/prisma'
import type { GoalType } from '@/generated/prisma'

export async function findByStudent(studentId: string, trainerId: string) {
  return prisma.goal.findMany({
    where: { studentId, trainerId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findById(id: string, trainerId: string) {
  return prisma.goal.findFirst({ where: { id, trainerId } })
}

export async function create(data: {
  studentId: string
  trainerId: string
  type: GoalType
  targetValue: number
  currentValue?: number
  deadline?: Date
}) {
  return prisma.goal.create({ data })
}

export async function update(
  id: string,
  data: { type?: GoalType; targetValue?: number; currentValue?: number; deadline?: Date | null }
) {
  return prisma.goal.update({ where: { id }, data })
}

export async function markAsAchieved(id: string) {
  return prisma.goal.update({ where: { id }, data: { achieved: true } })
}

export async function remove(id: string, trainerId: string) {
  return prisma.goal.deleteMany({ where: { id, trainerId } })
}
