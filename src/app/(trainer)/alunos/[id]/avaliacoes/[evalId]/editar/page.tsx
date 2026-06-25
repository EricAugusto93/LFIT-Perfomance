import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getEvaluation } from '@/services/evaluation.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { EvaluationForm } from '@/components/forms/EvaluationForm'

interface PageProps { params: Promise<{ id: string; evalId: string }> }

export default async function EditarAvaliacaoPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id, evalId } = await params

  let data
  try { data = await getEvaluation(evalId, session.sub) }
  catch { notFound() }

  const { evaluation: ev } = data

  const defaultValues = {
    date: new Date(ev.date).toISOString().split('T')[0],
    weight: ev.weight ?? undefined,
    height: ev.height ?? undefined,
    bodyFatPercentage: ev.bodyFatPercentage ?? undefined,
    leanMass: ev.leanMass ?? undefined,
    muscleMass: ev.muscleMass ?? undefined,
    notes: ev.notes ?? '',
    measurements: ev.measurements
      ? {
          shoulder: ev.measurements.shoulder ?? undefined,
          chest: ev.measurements.chest ?? undefined,
          waist: ev.measurements.waist ?? undefined,
          abdomen: ev.measurements.abdomen ?? undefined,
          hip: ev.measurements.hip ?? undefined,
          rightArm: ev.measurements.rightArm ?? undefined,
          leftArm: ev.measurements.leftArm ?? undefined,
          rightThigh: ev.measurements.rightThigh ?? undefined,
          leftThigh: ev.measurements.leftThigh ?? undefined,
          rightCalf: ev.measurements.rightCalf ?? undefined,
          leftCalf: ev.measurements.leftCalf ?? undefined,
        }
      : undefined,
    photos: ev.photos
      ? {
          frontUrl: ev.photos.frontUrl ?? '',
          backUrl: ev.photos.backUrl ?? '',
          leftProfileUrl: ev.photos.leftProfileUrl ?? '',
          rightProfileUrl: ev.photos.rightProfileUrl ?? '',
        }
      : undefined,
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Editar Avaliação"
        description={`Avaliação de ${new Intl.DateTimeFormat('pt-BR').format(new Date(ev.date))}`}
        backHref={`/alunos/${id}/avaliacoes/${evalId}`}
      />
      <EvaluationForm studentId={id} evaluationId={evalId} defaultValues={defaultValues} />
    </div>
  )
}
