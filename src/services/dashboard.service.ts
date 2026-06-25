import * as studentRepo from '@/repositories/student.repository'
import * as workoutRepo from '@/repositories/workout.repository'
import * as scheduleRepo from '@/repositories/schedule.repository'

export async function getDashboardData(trainerId: string) {
  const [studentCounts, expiredEvaluations, expiredWorkouts, upcomingEvents] = await Promise.all([
    studentRepo.countStudentsByStatus(trainerId),
    studentRepo.findStudentsWithExpiredEvaluation(trainerId, 30),
    workoutRepo.findExpiredWorkouts(trainerId),
    scheduleRepo.findUpcomingEvents(trainerId, 7),
  ])

  return {
    students: studentCounts,
    alerts: {
      expiredEvaluations,
      expiredWorkouts: expiredWorkouts.map((w) => ({
        id: w.id,
        name: w.name,
        division: w.division,
        expiresAt: w.expiresAt!,
        studentId: w.student.id,
        studentName: w.student.name,
      })),
    },
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type,
      startAt: e.startAt,
      endAt: e.endAt,
      studentName: e.student?.name ?? null,
    })),
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
