import * as repo from '@/repositories/schedule.repository'
import type { ScheduleEventType } from '@/generated/prisma'

export async function getMonthEvents(trainerId: string, year: number, month: number) {
  return repo.findByMonth(trainerId, year, month)
}

export async function createEvent(
  trainerId: string,
  data: {
    type: ScheduleEventType
    title: string
    description?: string
    startAt: string
    endAt: string
    studentId?: string
  }
) {
  return repo.create({
    trainerId,
    type: data.type,
    title: data.title,
    description: data.description,
    startAt: new Date(data.startAt),
    endAt: new Date(data.endAt),
    studentId: data.studentId ?? null,
  })
}

export async function updateEvent(
  id: string,
  trainerId: string,
  data: {
    type?: ScheduleEventType
    title?: string
    description?: string
    startAt?: string
    endAt?: string
    studentId?: string | null
  }
) {
  const existing = await repo.findById(id)
  if (!existing || existing.trainerId !== trainerId) throw new Error('NOT_FOUND')

  return repo.update(id, {
    ...(data.type && { type: data.type }),
    ...(data.title && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.startAt && { startAt: new Date(data.startAt) }),
    ...(data.endAt && { endAt: new Date(data.endAt) }),
    ...(data.studentId !== undefined && { studentId: data.studentId }),
  })
}

export async function deleteEvent(id: string, trainerId: string) {
  const result = await repo.remove(id, trainerId)
  if (result.count === 0) throw new Error('NOT_FOUND')
}
