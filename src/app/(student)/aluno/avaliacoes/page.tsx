import { requireStudentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ClipboardList } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MEASUREMENT_LABELS, MEASUREMENT_KEYS, bmiLabel } from '@/lib/validations/evaluation.schema'
import type { MeasurementsInput } from '@/lib/validations/evaluation.schema'

const fmt = (d: Date) => new Intl.DateTimeFormat('pt-BR').format(new Date(d))
const fmtNum = (n: number | null | undefined, unit = '') => n != null ? `${n}${unit}` : '—'

export default async function AlunoAvaliacoesPage() {
  const session = await requireStudentSession()

  const evaluations = await prisma.physicalEvaluation.findMany({
    where: { studentId: session.sub },
    include: { measurements: true },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Minhas Avaliações</h1>

      {evaluations.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center">
          <ClipboardList size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">Sem avaliações ainda</p>
          <p className="mt-1 text-sm text-gray-400">
            Seu personal registrará suas avaliações físicas aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((ev, index) => (
            <Card key={ev.id}>
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{fmt(ev.date)}</p>
                    {index === 0 && (
                      <span className="text-xs font-medium text-blue-600">Mais recente</span>
                    )}
                  </div>
                </div>

                {/* Dados principais */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Peso', value: fmtNum(ev.weight, ' kg') },
                    {
                      label: 'IMC',
                      value: ev.bmi ? `${ev.bmi} (${bmiLabel(ev.bmi)})` : '—',
                    },
                    { label: '% Gordura', value: fmtNum(ev.bodyFatPercentage, '%') },
                    { label: 'Massa Muscular', value: fmtNum(ev.muscleMass, ' kg') },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="font-semibold text-gray-900 text-sm">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Medidas */}
                {ev.measurements && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Medidas corporais
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {MEASUREMENT_KEYS.map((key) => {
                        const val = ev.measurements?.[key as keyof MeasurementsInput]
                        if (val == null) return null
                        return (
                          <div key={key} className="flex justify-between border-b py-1 text-sm">
                            <span className="text-gray-500">{MEASUREMENT_LABELS[key]}</span>
                            <span className="font-medium text-gray-900">{val} cm</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {ev.notes && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 italic">
                    {ev.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
