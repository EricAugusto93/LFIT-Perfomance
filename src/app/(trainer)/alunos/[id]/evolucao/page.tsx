import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TrendingUp, TrendingDown, Minus, ClipboardList } from 'lucide-react'
import { requireTrainerSession } from '@/lib/session'
import { getEvolutionData, type EvolutionIndicator } from '@/services/evolution.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeightChart } from '@/components/charts/WeightChart'
import { BodyCompositionChart } from '@/components/charts/BodyCompositionChart'
import { MeasurementsChart } from '@/components/charts/MeasurementsChart'

interface PageProps { params: Promise<{ id: string }> }

// ─── Indicador de status ─────────────────────────────────────────────────────

const INDICATOR_CONFIG: Record<
  EvolutionIndicator,
  { label: string; color: string; Icon: typeof TrendingUp }
> = {
  EVOLVING: {
    label: 'Evoluindo',
    color: 'border-green-200 bg-green-50 text-green-700',
    Icon: TrendingUp,
  },
  STABLE: {
    label: 'Estável',
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    Icon: Minus,
  },
  REGRESSION: {
    label: 'Regressão',
    color: 'border-red-200 bg-red-50 text-red-600',
    Icon: TrendingDown,
  },
}

// ─── Helper de diff colorido ─────────────────────────────────────────────────

function SummaryChange({
  value,
  unit,
  invertColor = false,
}: {
  value: number | null
  unit: string
  invertColor?: boolean
}) {
  if (value === null) return <span className="text-sm text-gray-300">sem dados</span>
  if (value === 0) return <span className="text-sm text-gray-400">sem alteração</span>

  const isPositive = value > 0
  const isGood = invertColor ? !isPositive : isPositive
  const color = isGood ? 'text-green-600' : 'text-red-500'
  const sign = isPositive ? '+' : ''

  return (
    <span className={`text-2xl font-bold ${color}`}>
      {sign}{value.toFixed(1)}{unit}
    </span>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default async function EvolucaoPage({ params }: PageProps) {
  const session = await requireTrainerSession()
  const { id } = await params

  let evolution
  try {
    evolution = await getEvolutionData(id, session.sub)
  } catch {
    notFound()
  }

  const { indicator, chartPoints, measurementPoints, summary } = evolution
  const { label, color, Icon } = INDICATOR_CONFIG[indicator]

  if (summary.evaluationCount === 0) {
    return (
      <div className="rounded-lg border border-dashed py-14 text-center">
        <ClipboardList size={36} className="mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-gray-600">Nenhuma avaliação registrada</p>
        <p className="mt-1 text-sm text-gray-400">
          Registre avaliações físicas para visualizar a evolução do aluno.
        </p>
        <Link
          href={`/alunos/${id}/avaliacoes/nova`}
          className="mt-4 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Registrar avaliação
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Indicador de status ── */}
      <div className={`flex items-center gap-3 rounded-lg border p-4 ${color}`}>
        <Icon size={22} />
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-sm opacity-80">
            {summary.evaluationCount} avaliação{summary.evaluationCount !== 1 ? 'ões' : ''}
            {summary.firstDate && summary.lastDate && summary.evaluationCount > 1
              ? ` · ${summary.firstDate} a ${summary.lastDate}`
              : ''}
          </p>
        </div>
      </div>

      {/* ── Cards de resumo (variação total) ── */}
      {summary.evaluationCount > 1 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Variação de peso</p>
              <SummaryChange value={summary.weightChange} unit=" kg" invertColor />
              <p className="mt-0.5 text-xs text-gray-400">desde a 1ª avaliação</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Variação de gordura</p>
              <SummaryChange value={summary.bodyFatChange} unit="%" invertColor />
              <p className="mt-0.5 text-xs text-gray-400">desde a 1ª avaliação</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-gray-500">Massa muscular</p>
              <SummaryChange value={summary.muscleMassChange} unit=" kg" />
              <p className="mt-0.5 text-xs text-gray-400">desde a 1ª avaliação</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Gráfico 1: Peso e IMC ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peso e IMC</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart data={chartPoints} />
        </CardContent>
      </Card>

      {/* ── Gráfico 2: Composição Corporal ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Composição Corporal</CardTitle>
        </CardHeader>
        <CardContent>
          <BodyCompositionChart data={chartPoints} />
        </CardContent>
      </Card>

      {/* ── Gráfico 3: Medidas Corporais ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medidas Corporais</CardTitle>
        </CardHeader>
        <CardContent>
          <MeasurementsChart data={measurementPoints} />
        </CardContent>
      </Card>

      <p className="text-right text-xs text-gray-400">
        <Link href={`/alunos/${id}/avaliacoes`} className="hover:underline">
          Ver histórico completo de avaliações →
        </Link>
      </p>
    </div>
  )
}
