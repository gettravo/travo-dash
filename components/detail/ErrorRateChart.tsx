'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { BucketedMetric } from '@/lib/utils'

interface Props {
  data: BucketedMetric[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatPct(v: number) {
  return `${Math.round(v * 100)}%`
}

export default function ErrorRateChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
        No data yet
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Error Rate — last 24h</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatPct}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={40}
            domain={[0, 1]}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
            labelFormatter={(v) => formatTime(v as string)}
            formatter={(v) => [formatPct(Number(v)), 'Error Rate']}
          />
          <Area
            type="monotone"
            dataKey="errorRate"
            stroke="#ef4444"
            fill="#ef444420"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
