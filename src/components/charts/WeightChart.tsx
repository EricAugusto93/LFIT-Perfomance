'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { ChartPoint } from '@/services/evolution.service'

interface WeightChartProps {
  data: ChartPoint[]
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Necessário ao menos 2 avaliações para exibir o gráfico.
      </p>
    )
  }

  const hasWeight = data.some((d) => d.weight !== null)
  const hasBmi = data.some((d) => d.bmi !== null)

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          yAxisId="weight"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          unit=" kg"
          domain={['auto', 'auto']}
        />
        <YAxis
          yAxisId="bmi"
          orientation="right"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, name) =>
            name === 'Peso' ? [`${value} kg`, String(name)] : [value, String(name)]
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {hasWeight && (
          <Line
            yAxisId="weight"
            type="monotone"
            dataKey="weight"
            name="Peso"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        )}
        {hasBmi && (
          <Line
            yAxisId="bmi"
            type="monotone"
            dataKey="bmi"
            name="IMC"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            dot={{ r: 2 }}
            connectNulls={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
