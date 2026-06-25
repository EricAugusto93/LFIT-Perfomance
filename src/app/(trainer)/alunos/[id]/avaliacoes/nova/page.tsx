import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getStudent } from '@/services/student.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { EvaluationForm } from '@/components/forms/EvaluationForm'

interface PageProps { params: Promise<{ id: string }> }

export default async function NovaAvaliacaoPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let student
  try { student = await getStudent(id, session.sub) }
  catch { notFound() }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Nova Avaliação"
        description={`Registrando avaliação de ${student.name}`}
        backHref={`/alunos/${id}/avaliacoes`}
      />
      <EvaluationForm studentId={id} />
    </div>
  )
}
