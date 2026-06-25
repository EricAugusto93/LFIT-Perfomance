import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { requireTrainerSession } from '@/lib/session'
import { getEvaluation } from '@/services/evaluation.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MEASUREMENT_LABELS,
  MEASUREMENT_KEYS,
  PHOTO_LABELS,
  bmiLabel,
} from '@/lib/validations/evaluation.schema'
import type { MeasurementsInput } from '@/lib/validations/evaluation.schema'

interface PageProps { params: Promise<{ id: string; evalId: string }> }

const fmt = (d: Date) => new Intl.DateTimeFormat('pt-BR').format(new Date(d))
const fmtNum = (n: number | null | undefined, unit = '') => n != null ? `${n}${unit}` : '—'

function DiffBadge({ diff, invertColor = false }: { diff: number | null; invertColor?: boolean }) {
  if (diff === null || diff === 0) return <span className="text-xs text-gray-400">sem alteração</span>
  const positive = invertColor ? diff < 0 : diff > 0
  return (
    <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {diff > 0 ? '+' : ''}{diff.toFixed(1)}
    </span>
  )
}

export default async function AvaliacaoDetailPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id, evalId } = await params

  let data
  try { data = await getEvaluation(evalId, session.sub) }
  catch { notFound() }

  const { evaluation: ev, previous, comparison } = data
  const photoEntries = Object.entries(PHOTO_LABELS) as [keyof typeof PHOTO_LABELS, string][]
  const hasPhotos = ev.photos && Object.values(ev.photos).some(Boolean)
  const prevHasPhotos = previous?.photos && Object.values(previous.photos).some(Boolean)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Avaliação — ${fmt(ev.date)}`}
        backHref={`/alunos/${id}/avaliacoes`}
        action={
          <Link href={`/alunos/${id}/avaliacoes/${evalId}/editar`}>
            <Button variant="outline" size="sm">Editar</Button>
          </Link>
        }
      />

      {/* Comparação banner */}
      {comparison && previous && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Comparando com avaliação anterior de <strong>{fmt(previous.date)}</strong>
        </div>
      )}

      {/* Dados principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Peso', value: fmtNum(ev.weight, ' kg'), diff: comparison?.weightDiff, invertColor: true },
          { label: 'IMC', value: ev.bmi ? `${ev.bmi} (${bmiLabel(ev.bmi)})` : '—', diff: comparison?.bmiDiff, invertColor: true },
          { label: '% Gordura', value: fmtNum(ev.bodyFatPercentage, '%'), diff: comparison?.bodyFatDiff, invertColor: true },
          { label: 'Massa Muscular', value: fmtNum(ev.muscleMass, ' kg'), diff: comparison?.muscleMassDiff, invertColor: false },
        ].map(({ label, value, diff, invertColor }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
              {diff !== undefined && <DiffBadge diff={diff} invertColor={invertColor} />}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Medidas */}
      {ev.measurements && (
        <Card>
          <CardHeader><CardTitle className="text-base">Medidas Corporais (cm)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {MEASUREMENT_KEYS.map((key) => {
                const val = ev.measurements?.[key as keyof MeasurementsInput]
                const prevVal = previous?.measurements?.[key as keyof MeasurementsInput]
                const d = comparison?.measurements
                  ? (comparison.measurements as Record<string, number | null>)[`${key}Diff`]
                  : null
                return (
                  <div key={key} className="flex items-center justify-between border-b py-2 text-sm">
                    <span className="text-gray-500">{MEASUREMENT_LABELS[key]}</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">{fmtNum(val, ' cm')}</span>
                      {d !== undefined && d !== null && (
                        <DiffBadge diff={d} invertColor />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notas */}
      {ev.notes && (
        <Card>
          <CardContent className="p-4 text-sm text-gray-700">{ev.notes}</CardContent>
        </Card>
      )}

      {/* Fotos */}
      {(hasPhotos || prevHasPhotos) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Fotos de Evolução</CardTitle></CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${previous && prevHasPhotos ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {photoEntries.map(([key, label]) => {
                const curUrl = ev.photos?.[key as keyof typeof ev.photos]
                const prevUrl = previous?.photos?.[key as keyof typeof previous.photos]
                if (!curUrl && !prevUrl) return null
                return (
                  <div key={key} className="space-y-2">
                    <p className="text-center text-xs font-medium text-gray-500">{label}</p>
                    <div className={`grid gap-2 ${previous && prevHasPhotos ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {previous && prevHasPhotos && (
                        <div className="space-y-1">
                          <p className="text-center text-xs text-gray-400">{fmt(previous.date)}</p>
                          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                            {typeof prevUrl === 'string' && prevUrl ? <Image src={prevUrl} alt={label} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-gray-300">Sem foto</div>}
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-center text-xs text-gray-400">{fmt(ev.date)}</p>
                        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                          {typeof curUrl === 'string' && curUrl ? <Image src={curUrl} alt={label} fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-gray-300">Sem foto</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
