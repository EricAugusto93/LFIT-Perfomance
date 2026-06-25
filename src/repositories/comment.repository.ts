import { prisma } from '@/lib/prisma'
import type { CommentType } from '@/generated/prisma'

export async function findByStudent(studentId: string, trainerId: string, type?: CommentType) {
  return prisma.comment.findMany({
    where: {
      studentId,
      trainerId,
      ...(type && { type }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function create(data: {
  studentId: string
  trainerId: string
  content: string
  type: CommentType
}) {
  return prisma.comment.create({ data })
}

export async function remove(id: string, trainerId: string) {
  return prisma.comment.deleteMany({ where: { id, trainerId } })
}
