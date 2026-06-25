import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Dumbbell, RotateCcw, CirclePlay, ChevronDown } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { getWorkout } from '@/services/workout.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MUSCLE_GROUP_LABELS } from '@/lib/validations/exercise.schema'
import { WorkoutActions } from './WorkoutActions'

interface PageProps {
  params: Promise<{ id: string; workoutId: string }>
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id, workoutId } = await params

  let workout
  try {
    workout = await getWorkout(workoutId, session.sub)
  } catch {
    notFound()
  }

  const isExpired = workout.expiresAt && new Date(workout.expiresAt) < new Date()

  return (
    <div className="space-y-6">
      <PageHeader
        title={workout.name}
        description={`Treino ${workout.division}${workout.description ? ` · ${workout.description}` : ''}`}
        backHref={`/alunos/${id}/treinos`}
        action={
          <div className="flex gap-2">
            <Link href={`/alunos/${id}/treinos/${workoutId}/editar`}>
              <Button variant="outline" size="sm">Editar</Button>
            </Link>
            <WorkoutActions workoutId={workoutId} studentId={id} isActive={workout.isActive} />
          </div>
        }
      />

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Badge variant={workout.isActive ? 'default' : 'secondary'}>
          {workout.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
        {isExpired && (
          <Badge variant="outline" className="border-red-200 text-red-600">Vencido</Badge>
        )}
        {workout.expiresAt && (
          <span className="text-gray-400">
            Válido até {new Intl.DateTimeFormat('pt-BR').format(new Date(workout.expiresAt))}
          </span>
        )}
        <span className="text-gray-400">{workout.exercises.length} exercício{workout.exercises.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {workout.exercises.map((we, index) => (
          <Card key={we.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{we.exercise.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {MUSCLE_GROUP_LABELS[we.exercise.muscleGroup]}
                      </Badge>
                      {we.exercise.equipment && (
                        <span className="text-xs text-gray-400">{we.exercise.equipment}</span>
                      )}
                    </div>
                  </div>
                </div>
                {we.exercise.videoUrl && (
                  <a href={we.exercise.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100">
                    <CirclePlay size={12} />
                    Vídeo
                  </a>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-400">Séries</p>
                  <p className="font-semibold text-gray-900">{we.sets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Repetições</p>
                  <p className="font-semibold text-gray-900">{we.reps}</p>
                </div>
                {we.restTime != null && (
                  <div>
                    <p className="text-xs text-gray-400">Descanso</p>
                    <p className="font-semibold text-gray-900">{we.restTime}s</p>
                  </div>
                )}
                {we.load != null && (
                  <div>
                    <p className="text-xs text-gray-400">Carga</p>
                    <p className="font-semibold text-gray-900">{we.load} kg</p>
                  </div>
                )}
              </div>

              {we.observations && (
                <p className="mt-2 rounded bg-gray-50 px-3 py-1.5 text-xs text-gray-600 italic">
                  {we.observations}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History */}
      {workout.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RotateCcw size={16} />
              Histórico de alterações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {workout.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{h.description}</span>
                <span className="text-xs text-gray-400">
                  {new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  }).format(new Date(h.createdAt))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
