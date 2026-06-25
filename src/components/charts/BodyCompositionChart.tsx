'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { ChartPoint } from '@/services/evolution.service'

interface BodyCompositionChartProps {
  data: ChartPoint[]
}

export function BodyCompositionChart({ data }: BodyCompositionChartProps) {
  if (data.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Necessário ao menos 2 avaliações para exibir o gráfico.
      </p>
    )
  }

  const hasBodyFat = data.some((d) => d.bodyFat !== null)
  const hasMuscleMass = data.some((d) => d.muscleMass !== null)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          yAxisId="fat"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit="%"
          domain={['auto', 'auto']}
        />
        <YAxis
          yAxisId="muscle"
          orientation="right"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit=" kg"
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, name) =>
            String(name) === '% Gordura' ? [`${value}%`, String(name)] : [`${value} kg`, String(name)]
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {hasBodyFat && (
          <Line
            yAxisId="fat"
            type="monotone"
            dataKey="bodyFat"
            name="% Gordura"
            stroke="#ea580c"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        )}
        {hasMuscleMass && (
          <Line
            yAxisId="muscle"
            type="monotone"
            dataKey="muscleMass"
            name="Massa Muscular"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
