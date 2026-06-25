import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@/generated/prisma'

export async function findAll(trainerId: string) {
  return prisma.notification.findMany({
    where: { trainerId },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findUnread(trainerId: string) {
  return prisma.notification.findMany({
    where: { trainerId, read: false },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function countUnread(trainerId: string) {
  return prisma.notification.count({ where: { trainerId, read: false } })
}

export async function markAsRead(id: string, trainerId: string) {
  return prisma.notification.updateMany({ where: { id, trainerId }, data: { read: true } })
}

export async function markAllAsRead(trainerId: string) {
  return prisma.notification.updateMany({ where: { trainerId, read: false }, data: { read: true } })
}

export async function create(data: {
  trainerId: string
  studentId?: string
  type: NotificationType
  message: string
}) {
  return prisma.notification.create({ data })
}

export async function existsToday(
  trainerId: string,
  studentId: string | null,
  type: NotificationType
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const count = await prisma.notification.count({
    where: {
      trainerId,
      studentId: studentId ?? undefined,
      type,
      createdAt: { gte: today, lt: tomorrow },
    },
  })
  return count > 0
}
