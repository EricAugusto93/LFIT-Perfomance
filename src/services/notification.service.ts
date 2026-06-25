import * as repo from '@/repositories/notification.repository'
import { prisma } from '@/lib/prisma'

export async function listNotifications(trainerId: string) {
  return repo.findAll(trainerId)
}

export async function getUnreadCount(trainerId: string) {
  return repo.countUnread(trainerId)
}

export async function markAsRead(id: string, trainerId: string) {
  await repo.markAsRead(id, trainerId)
}

export async function markAllAsRead(trainerId: string) {
  await repo.markAllAsRead(trainerId)
}

export async function generateNotifications(trainerId: string): Promise<void> {
  const today = new Date()
  // Usar UTC para comparações consistentes com datas vindas do banco
  const todayUTCMonth = today.getUTCMonth()
  const todayUTCDay = today.getUTCDate()

  const cutoff30 = new Date()
  cutoff30.setDate(cutoff30.getDate() - 30)

  const cutoff15 = new Date()
  cutoff15.setDate(cutoff15.getDate() - 15)

  const students = await prisma.student.findMany({
    where: { trainerId, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      evaluations: {
        orderBy: { date: 'desc' },
        take: 1,
        select: { date: true },
      },
      weightRecords: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
        select: { recordedAt: true },
      },
      loadRecords: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
        select: { recordedAt: true },
      },
      workouts: {
        where: { isActive: true, expiresAt: { lt: today } },
        select: { id: true, name: true, division: true },
      },
    },
  })

  for (const student of students) {
    // EXPIRED_EVALUATION
    const lastEval = student.evaluations[0]?.date ?? null
    if (!lastEval || lastEval < cutoff30) {
      const exists = await repo.existsToday(trainerId, student.id, 'EXPIRED_EVALUATION')
      if (!exists) {
        const days = lastEval
          ? Math.floor((Date.now() - new Date(lastEval).getTime()) / (1000 * 60 * 60 * 24))
          : null
        await repo.create({
          trainerId,
          studentId: student.id,
          type: 'EXPIRED_EVALUATION',
          message: lastEval
            ? `${student.name}: avaliação física vencida (última há ${days} dias)`
            : `${student.name}: nunca realizou avaliação física`,
        })
      }
    }

    // EXPIRED_WORKOUT — uma notificação por aluno listando todos os treinos vencidos
    if (student.workouts.length > 0) {
      const exists = await repo.existsToday(trainerId, student.id, 'EXPIRED_WORKOUT')
      if (!exists) {
        const workoutList = student.workouts
          .map((w) => `Treino ${w.division} "${w.name}"`)
          .join(', ')
        await repo.create({
          trainerId,
          studentId: student.id,
          type: 'EXPIRED_WORKOUT',
          message: `${student.name}: ${workoutList} vencido${student.workouts.length > 1 ? 's' : ''}`,
        })
      }
    }

    // NO_UPDATE
    const lastWeight = student.weightRecords[0]?.recordedAt ?? null
    const lastLoad = student.loadRecords[0]?.recordedAt ?? null
    const lastActivity =
      lastWeight && lastLoad
        ? new Date(Math.max(new Date(lastWeight).getTime(), new Date(lastLoad).getTime()))
        : lastWeight
          ? new Date(lastWeight)
          : lastLoad
            ? new Date(lastLoad)
            : null

    if (!lastActivity || lastActivity < cutoff15) {
      const exists = await repo.existsToday(trainerId, student.id, 'NO_UPDATE')
      if (!exists) {
        await repo.create({
          trainerId,
          studentId: student.id,
          type: 'NO_UPDATE',
          message: `${student.name}: sem registros de treino ou peso há mais de 15 dias`,
        })
      }
    }

    // BIRTHDAY — comparar UTC para evitar desfasagem de timezone
    if (student.dateOfBirth) {
      const dob = new Date(student.dateOfBirth)
      if (dob.getUTCMonth() === todayUTCMonth && dob.getUTCDate() === todayUTCDay) {
        const exists = await repo.existsToday(trainerId, student.id, 'BIRTHDAY')
        if (!exists) {
          const age = today.getUTCFullYear() - dob.getUTCFullYear()
          await repo.create({
            trainerId,
            studentId: student.id,
            type: 'BIRTHDAY',
            message: `${student.name} faz ${age} anos hoje!`,
          })
        }
      }
    }
  }
}
