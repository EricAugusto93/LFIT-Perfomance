import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getStudent } from '@/services/student.service'
import { listExercises } from '@/services/exercise.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { WorkoutForm } from '@/components/forms/WorkoutForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NovoTreinoPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let student
  try {
    student = await getStudent(id, session.sub)
  } catch {
    notFound()
  }

  const exercises = await listExercises(session.sub)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Novo Treino"
        description={`Criando treino para ${student.name}`}
        backHref={`/alunos/${id}/treinos`}
      />
      <WorkoutForm studentId={id} exercises={exercises} />
    </div>
  )
}
