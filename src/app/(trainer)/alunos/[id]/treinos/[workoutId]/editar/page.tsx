import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getWorkout } from '@/services/workout.service'
import { listExercises } from '@/services/exercise.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { WorkoutForm } from '@/components/forms/WorkoutForm'

interface PageProps {
  params: Promise<{ id: string; workoutId: string }>
}

export default async function EditarTreinoPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id, workoutId } = await params

  let workout
  try {
    workout = await getWorkout(workoutId, session.sub)
  } catch {
    notFound()
  }

  const exercises = await listExercises(session.sub)

  const defaultValues = {
    name: workout.name,
    division: workout.division,
    description: workout.description ?? '',
    expiresAt: workout.expiresAt
      ? new Date(workout.expiresAt).toISOString().split('T')[0]
      : '',
    exercises: workout.exercises.map((we) => ({
      exerciseId: we.exerciseId,
      sets: we.sets,
      reps: we.reps,
      restTime: we.restTime ?? undefined,
      load: we.load ?? undefined,
      observations: we.observations ?? '',
      order: we.order,
    })),
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Editar Treino"
        description={workout.name}
        backHref={`/alunos/${id}/treinos/${workoutId}`}
      />
      <WorkoutForm
        studentId={id}
        workoutId={workoutId}
        defaultValues={defaultValues}
        exercises={exercises}
      />
    </div>
  )
}
