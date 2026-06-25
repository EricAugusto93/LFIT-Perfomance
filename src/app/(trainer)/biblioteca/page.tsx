import Link from 'next/link'
import { requireTrainerSession } from '@/lib/session'
import { listExercises } from '@/services/exercise.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { ExerciseGrid } from './ExerciseGrid'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUPS } from '@/lib/validations/exercise.schema'
import { cn } from '@/lib/utils'
import type { MuscleGroup } from '@/generated/prisma'

interface PageProps {
  searchParams: Promise<{ muscleGroup?: string; search?: string }>
}

export default async function BibliotecaPage({ searchParams }: PageProps) {
  const session = await requireTrainerSession()
  const { muscleGroup, search } = await searchParams

  const exercises = await listExercises(session.sub, {
    muscleGroup: muscleGroup as MuscleGroup | undefined,
    search,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Exercícios"
        description={`${exercises.length} exercício${exercises.length !== 1 ? 's' : ''}`}
      />

      {/* Filtro por grupo muscular */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/biblioteca"
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            !muscleGroup
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'
          )}
        >
          Todos
        </Link>
        {MUSCLE_GROUPS.map((g) => (
          <Link
            key={g}
            href={`/biblioteca?muscleGroup=${g}`}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              muscleGroup === g
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            )}
          >
            {MUSCLE_GROUP_LABELS[g]}
          </Link>
        ))}
      </div>

      <ExerciseGrid exercises={exercises} />
    </div>
  )
}
