import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClipboardList, Dumbbell, MessageSquare, Scale } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { getStudent } from '@/services/student.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OBJECTIVE_LABELS, STATUS_LABELS, SEX_LABELS } from '@/lib/validations/student.schema'

interface PageProps {
  params: Promise<{ id: string }>
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between py-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  )
}

export default async function StudentOverviewPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let student
  try {
    student = await getStudent(id, session.sub)
  } catch {
    notFound()
  }

  const lastEval = student.evaluations[0] ?? null
  const activeWorkout = student.workouts[0] ?? null

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Quick cards */}
      <div className="space-y-4 lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
        {/* Última avaliação */}
        <Link href={`/alunos/${id}/avaliacoes`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Última avaliação</p>
                {lastEval ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {new Intl.DateTimeFormat('pt-BR').format(new Date(lastEval.date))}
                    </p>
                    {lastEval.weight && (
                      <p className="text-xs text-gray-400">{lastEval.weight} kg</p>
                    )}
                  </>
                ) : (
                  <p className="font-semibold text-gray-400">Sem avaliação</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Treino ativo */}
        <Link href={`/alunos/${id}/treinos`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="rounded-lg bg-green-100 p-2.5 text-green-600">
                <Dumbbell size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Treino ativo</p>
                {activeWorkout ? (
                  <>
                    <p className="font-semibold text-gray-900">{activeWorkout.name}</p>
                    <p className="text-xs text-gray-400">Divisão {activeWorkout.division}</p>
                  </>
                ) : (
                  <p className="font-semibold text-gray-400">Sem treino</p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Peso atual */}
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="rounded-lg bg-purple-100 p-2.5 text-purple-600">
              <Scale size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Peso atual</p>
              <p className="font-semibold text-gray-900">
                {student.weight ? `${student.weight} kg` : '—'}
              </p>
              {student.height && (
                <p className="text-xs text-gray-400">{student.height} cm</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados pessoais */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          <InfoRow label="Status" value={STATUS_LABELS[student.status]} />
          <InfoRow
            label="Objetivo"
            value={student.objective ? OBJECTIVE_LABELS[student.objective] : null}
          />
          <InfoRow label="E-mail" value={student.email} />
          <InfoRow label="Telefone" value={student.phone} />
          <InfoRow
            label="Data de nascimento"
            value={
              student.dateOfBirth
                ? new Intl.DateTimeFormat('pt-BR').format(new Date(student.dateOfBirth))
                : null
            }
          />
          <InfoRow label="Sexo" value={student.sex ? SEX_LABELS[student.sex] : null} />
          <InfoRow label="Altura" value={student.height ? `${student.height} cm` : null} />
          <InfoRow label="Peso" value={student.weight ? `${student.weight} kg` : null} />
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saúde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {student.observations && (
            <div>
              <p className="font-medium text-gray-700">Observações</p>
              <p className="mt-1 text-gray-500">{student.observations}</p>
            </div>
          )}
          {student.physicalRestrictions && (
            <div>
              <p className="font-medium text-gray-700">Restrições físicas</p>
              <p className="mt-1 text-gray-500">{student.physicalRestrictions}</p>
            </div>
          )}
          {student.pathologies && (
            <div>
              <p className="font-medium text-gray-700">Patologias e lesões</p>
              <p className="mt-1 text-gray-500">{student.pathologies}</p>
            </div>
          )}
          {student.medications && (
            <div>
              <p className="font-medium text-gray-700">Medicamentos</p>
              <p className="mt-1 text-gray-500">{student.medications}</p>
            </div>
          )}
          {!student.observations &&
            !student.physicalRestrictions &&
            !student.pathologies &&
            !student.medications && (
              <p className="text-gray-400">Nenhuma informação de saúde registrada.</p>
            )}
        </CardContent>
      </Card>

      {/* Atalho comentários */}
      <Link href={`/alunos/${id}/comentarios`} className="lg:col-span-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare size={18} className="text-gray-400" />
            <p className="text-sm text-gray-500">Ver comentários e acompanhamento deste aluno →</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
