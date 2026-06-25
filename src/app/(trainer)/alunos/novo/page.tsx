import { PageHeader } from '@/components/shared/PageHeader'
import { StudentForm } from '@/components/forms/StudentForm'

export default function NovoAlunoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Novo Aluno"
        description="Preencha os dados do aluno para cadastrá-lo no sistema."
        backHref="/alunos"
      />
      <StudentForm />
    </div>
  )
}
