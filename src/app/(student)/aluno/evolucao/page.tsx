import { requireStudentSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { WeightRegistration } from './WeightRegistration'
import { WeightChart } from '@/components/charts/WeightChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(d))

export default async function AlunoEvolucaoPage() {
  const session = await requireStudentSession()
  const studentId = session.sub

  const [evaluations, weightRecords] = await Promise.all([
    prisma.physicalEvaluation.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
      select: { date: true, weight: true, bmi: true, bodyFatPercentage: true, muscleMass: true },
    }),
    prisma.weightRecord.findMany({
      where: { studentId },
      orderBy: { recordedAt: 'asc' },
    }),
  ])

  // Combina pontos para o gráfico reutilizando WeightChart
  const evalPoints = evaluations.map((e) => ({
    date: fmt(e.date),
    dateISO: new Date(e.date).toISOString(),
    weight: e.weight,
    bmi: e.bmi,
    bodyFat: e.bodyFatPercentage,
    muscleMass: e.muscleMass,
    leanMass: null,
  }))

  const selfPoints = weightRecords.map((w) => ({
    date: fmt(w.recordedAt),
    dateISO: new Date(w.recordedAt).toISOString(),
    weight: w.weight,
    bmi: null,
    bodyFat: null,
    muscleMass: null,
    leanMass: null,
  }))

  const chartPoints = [...evalPoints, ...selfPoints].sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  )

  const lastEval = evaluations[evaluations.length - 1]
  const lastWeight = weightRecords[weightRecords.length - 1]
  const currentWeight = lastWeight?.weight ?? lastEval?.weight ?? null

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Minha Evolução</h1>

      {/* Peso atual + registro */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Peso atual</p>
              <p className="text-3xl font-bold text-gray-900">
                {currentWeight ? `${currentWeight} kg` : '—'}
              </p>
            </div>
            <WeightRegistration />
          </div>
        </CardContent>
      </Card>

      {/* Cards de métricas da última avaliação */}
      {lastEval && (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">% Gordura</p>
              <p className="text-2xl font-bold text-gray-900">
                {lastEval.bodyFatPercentage ? `${lastEval.bodyFatPercentage}%` : '—'}
              </p>
              <p className="text-xs text-gray-400">avaliação de {fmt(lastEval.date)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Massa Muscular</p>
              <p className="text-2xl font-bold text-gray-900">
                {lastEval.muscleMass ? `${lastEval.muscleMass} kg` : '—'}
              </p>
              <p className="text-xs text-gray-400">avaliação de {fmt(lastEval.date)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de peso */}
      <Card>
        <CardHeader><CardTitle className="text-base">Peso ao longo do tempo</CardTitle></CardHeader>
        <CardContent>
          <WeightChart data={chartPoints} />
        </CardContent>
      </Card>
    </div>
  )
}
