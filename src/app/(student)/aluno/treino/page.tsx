import { requireStudentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { WorkoutViewer } from './WorkoutViewer'

export default async function AlunoTreinoPage() {
  const session = await requireStudentSession()
  const studentId = session.sub

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { name: true },
  })

  const workouts = await prisma.workout.findMany({
    where: { studentId, isActive: true },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { division: 'asc' },
  })

  // Busca último load de cada exercício para pré-preencher
  const lastLoads: Record<string, { load: number; reps: number | null; recordedAt: Date }> = {}
  for (const workout of workouts) {
    for (const we of workout.exercises) {
      const last = await prisma.loadRecord.findFirst({
        where: { studentId, workoutExerciseId: we.id },
        orderBy: { recordedAt: 'desc' },
        select: { load: true, reps: true, recordedAt: true },
      })
      if (last) lastLoads[we.id] = last
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Olá, {student?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500">Seu treino de hoje</p>
      </div>

      {workouts.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="font-medium text-gray-500">Nenhum treino ativo</p>
          <p className="mt-1 text-sm text-gray-400">
            Aguarde seu personal configurar seu treino.
          </p>
        </div>
      ) : (
        <WorkoutViewer workouts={workouts} lastLoads={lastLoads} />
      )}
    </div>
  )
}
