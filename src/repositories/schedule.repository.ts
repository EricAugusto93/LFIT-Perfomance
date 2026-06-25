import { prisma } from '@/lib/prisma'

export async function findUpcomingEvents(trainerId: string, days = 7) {
  const now = new Date()
  const until = new Date()
  until.setDate(until.getDate() + days)

  return prisma.scheduleEvent.findMany({
    where: {
      trainerId,
      startAt: { gte: now, lte: until },
    },
    select: {
      id: true,
      title: true,
      type: true,
      startAt: true,
      endAt: true,
      student: { select: { id: true, name: true } },
    },
    orderBy: { startAt: 'asc' },
  })
}

export async function findByMonth(trainerId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59)

  return prisma.scheduleEvent.findMany({
    where: {
      trainerId,
      startAt: { gte: start, lte: end },
    },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { startAt: 'asc' },
  })
}

export async function findById(id: string) {
  return prisma.scheduleEvent.findFirst({ where: { id } })
}

export async function create(data: Parameters<typeof prisma.scheduleEvent.create>[0]['data']) {
  return prisma.scheduleEvent.create({ data })
}

export async function update(id: string, data: Parameters<typeof prisma.scheduleEvent.update>[0]['data']) {
  return prisma.scheduleEvent.update({ where: { id }, data })
}

export async function remove(id: string, trainerId: string) {
  return prisma.scheduleEvent.deleteMany({ where: { id, trainerId } })
}
