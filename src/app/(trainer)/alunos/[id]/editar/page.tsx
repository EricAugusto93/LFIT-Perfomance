import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getStudent } from '@/services/student.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { StudentForm } from '@/components/forms/StudentForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarAlunoPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let student
  try {
    student = await getStudent(id, session.sub)
  } catch {
    notFound()
  }

  const defaultValues = {
    name: student.name,
    email: student.email ?? '',
    phone: student.phone ?? '',
    photoUrl: student.photoUrl ?? '',
    dateOfBirth: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().split('T')[0]
      : '',
    sex: student.sex ?? undefined,
    height: student.height ?? undefined,
    weight: student.weight ?? undefined,
    objective: student.objective ?? undefined,
    status: student.status,
    observations: student.observations ?? '',
    physicalRestrictions: student.physicalRestrictions ?? '',
    pathologies: student.pathologies ?? '',
    medications: student.medications ?? '',
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Editar Aluno"
        description={`Editando dados de ${student.name}`}
        backHref={`/alunos/${id}`}
      />
      <StudentForm defaultValues={defaultValues} studentId={id} />
    </div>
  )
}
