'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS } from '@/lib/validations/evaluation.schema'
import type { MeasurementPoint } from '@/services/evolution.service'
import type { MeasurementsInput } from '@/lib/validations/evaluation.schema'

interface MeasurementsChartProps {
  data: MeasurementPoint[]
}

export function MeasurementsChart({ data }: MeasurementsChartProps) {
  const [selected, setSelected] = useState<keyof MeasurementsInput>(MEASUREMENT_KEYS[0])

  if (data.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Necessário ao menos 2 avaliações para exibir o gráfico.
      </p>
    )
  }

  const hasAnyData = MEASUREMENT_KEYS.some((key) =>
    data.some((d) => d[key] != null)
  )

  if (!hasAnyData) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Nenhuma medida corporal registrada nas avaliações.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Seletor de medida */}
      <div className="flex flex-wrap gap-1.5">
        {MEASUREMENT_KEYS.map((key) => {
          const hasData = data.some((d) => d[key] != null)
          if (!hasData) return null
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected === key
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {MEASUREMENT_LABELS[key]}
            </button>
          )
        })}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data.map((d) => ({ ...d, value: d[selected] }))}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit=" cm"
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value) => [`${value} cm`, MEASUREMENT_LABELS[selected]]}
          />
          <Line
            type="monotone"
            dataKey="value"
            name={MEASUREMENT_LABELS[selected]}
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
