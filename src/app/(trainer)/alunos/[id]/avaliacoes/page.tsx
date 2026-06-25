import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus, ClipboardList } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { listEvaluations } from '@/services/evaluation.service'
import { getStudent } from '@/services/student.service'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { bmiLabel } from '@/lib/validations/evaluation.schema'

interface PageProps { params: Promise<{ id: string }> }

const fmt = (d: Date) => new Intl.DateTimeFormat('pt-BR').format(new Date(d))
const fmtNum = (n: number | null | undefined, unit = '') =>
  n != null ? `${n}${unit}` : '—'

export default async function AvaliacoesPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let evaluations
  try {
    await getStudent(id, session.sub)
    evaluations = await listEvaluations(id, session.sub)
  } catch { notFound() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {evaluations.length} avaliação{evaluations.length !== 1 ? 'ões' : ''} registrada{evaluations.length !== 1 ? 's' : ''}
        </p>
        <Link href={`/alunos/${id}/avaliacoes/nova`}>
          <Button size="sm">
            <Plus size={14} className="mr-1.5" />
            Nova avaliação
          </Button>
        </Link>
      </div>

      {evaluations.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12">
          <EmptyState icon={ClipboardList} message="Nenhuma avaliação registrada ainda." />
          <div className="mt-4 flex justify-center">
            <Link href={`/alunos/${id}/avaliacoes/nova`}>
              <Button variant="outline">Registrar primeira avaliação</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {evaluations.map((ev, index) => {
            const prev = evaluations[index + 1]
            const weightDiff = ev.weight && prev?.weight ? ev.weight - prev.weight : null

            return (
              <Link key={ev.id} href={`/alunos/${id}/avaliacoes/${ev.id}`}>
                <div className="flex items-center justify-between rounded-lg border bg-white p-4 transition-shadow hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                      {evaluations.length - index}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{fmt(ev.date)}</p>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>Peso: {fmtNum(ev.weight, ' kg')}</span>
                        <span>IMC: {fmtNum(ev.bmi)}{ev.bmi ? ` (${bmiLabel(ev.bmi)})` : ''}</span>
                        <span>Gordura: {fmtNum(ev.bodyFatPercentage, '%')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {index === 0 && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs">
                        Mais recente
                      </Badge>
                    )}
                    {weightDiff !== null && (
                      <span className={`text-sm font-medium ${weightDiff < 0 ? 'text-green-600' : weightDiff > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
