import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus, Dumbbell } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { listWorkouts } from '@/services/workout.service'
import { getStudent } from '@/services/student.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TreinosPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let workouts
  try {
    await getStudent(id, session.sub)
    workouts = await listWorkouts(id, session.sub)
  } catch {
    notFound()
  }

  const activeWorkouts = workouts.filter((w) => w.isActive)
  const inactiveWorkouts = workouts.filter((w) => !w.isActive)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{workouts.length} treino{workouts.length !== 1 ? 's' : ''} no total</p>
        <Link href={`/alunos/${id}/treinos/novo`}>
          <Button size="sm">
            <Plus size={14} className="mr-1.5" />
            Novo treino
          </Button>
        </Link>
      </div>

      {workouts.length === 0 && (
        <div className="rounded-lg border border-dashed py-12">
          <EmptyState icon={Dumbbell} message="Nenhum treino cadastrado para este aluno." />
        </div>
      )}

      {activeWorkouts.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Ativos</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeWorkouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} studentId={id} />
            ))}
          </div>
        </section>
      )}

      {inactiveWorkouts.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Inativos</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactiveWorkouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} studentId={id} inactive />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function WorkoutCard({
  workout,
  studentId,
  inactive = false,
}: {
  workout: { id: string; name: string; division: string; expiresAt: Date | null; exercises: unknown[] }
  studentId: string
  inactive?: boolean
}) {
  const expired = workout.expiresAt && new Date(workout.expiresAt) < new Date()

  return (
    <Link href={`/alunos/${studentId}/treinos/${workout.id}`}>
      <div className={cn(
        'rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm',
        inactive && 'opacity-60'
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded bg-gray-900 px-2 py-0.5 text-xs font-bold text-white">
                {workout.division}
              </span>
              <p className="truncate font-medium text-gray-900">{workout.name}</p>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {(workout.exercises as unknown[]).length} exercício{(workout.exercises as unknown[]).length !== 1 ? 's' : ''}
            </p>
          </div>
          {expired && (
            <Badge variant="outline" className="shrink-0 border-red-200 bg-red-50 text-xs text-red-600">
              Vencido
            </Badge>
          )}
        </div>
        {workout.expiresAt && (
          <p className="mt-2 text-xs text-gray-400">
            Válido até{' '}
            {new Intl.DateTimeFormat('pt-BR').format(new Date(workout.expiresAt))}
          </p>
        )}
      </div>
    </Link>
  )
}
