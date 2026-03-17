'use client'

import { useState } from 'react'
import { RotateCcw, Loader2, CheckCircle, AlertTriangle, CheckCircle2, Minus } from 'lucide-react'

interface ApiRow {
  id: string
  name: string
  slug: string
  category: string
  status: string
  latencyMs: number | null
  uptime24h: number | null
  activeIncident: { type: string; severity: string } | null
}

type ResetState = 'idle' | 'loading' | 'done' | 'error'

export default function AdminDashboardClient({
  apis,
  adminSecret,
}: {
  apis: ApiRow[]
  adminSecret: string
}) {
  const [resetStates, setResetStates] = useState<Record<string, ResetState>>({})
  const [resetResults, setResetResults] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState('')

  async function handleReset(slug: string) {
    setResetStates((p) => ({ ...p, [slug]: 'loading' }))
    try {
      const res = await fetch('/api-routes/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ slug }),
      })
      const data = await res.json()
      if (res.ok) {
        setResetStates((p) => ({ ...p, [slug]: 'done' }))
        setResetResults((p) => ({
          ...p,
          [slug]: `Deleted ${data.deletedMetrics} metrics, closed ${data.closedIncidents} incidents`,
        }))
        setTimeout(() => setResetStates((p) => ({ ...p, [slug]: 'idle' })), 4000)
      } else {
        setResetStates((p) => ({ ...p, [slug]: 'error' }))
        setResetResults((p) => ({ ...p, [slug]: data.error ?? 'Error' }))
        setTimeout(() => setResetStates((p) => ({ ...p, [slug]: 'idle' })), 4000)
      }
    } catch {
      setResetStates((p) => ({ ...p, [slug]: 'error' }))
      setTimeout(() => setResetStates((p) => ({ ...p, [slug]: 'idle' })), 4000)
    }
  }

  const filtered = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.category.toLowerCase().includes(filter.toLowerCase())
  )

  const categories = Array.from(new Set(apis.map((a) => a.category)))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter APIs…"
          className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-500 w-64"
        />
        <p className="text-xs text-gray-600">{filtered.length} APIs</p>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">API</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Latency</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uptime 24h</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Incident</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((api) => {
              const state = resetStates[api.slug] ?? 'idle'
              return (
                <tr key={api.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{api.name}</p>
                      <p className="text-xs text-gray-600">{api.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={api.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {api.latencyMs != null ? `${api.latencyMs}ms` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {api.uptime24h != null ? `${api.uptime24h.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {api.activeIncident ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                          api.activeIncident.severity === 'critical'
                            ? 'bg-red-900/30 border-red-800/50 text-red-300'
                            : 'bg-yellow-900/30 border-yellow-800/50 text-yellow-300'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {api.activeIncident.type.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReset(api.slug)}
                        disabled={state === 'loading'}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                          state === 'done'
                            ? 'bg-green-900/20 border-green-800/40 text-green-400'
                            : state === 'error'
                            ? 'bg-red-900/20 border-red-800/40 text-red-400'
                            : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {state === 'loading' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : state === 'done' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <RotateCcw className="w-3 h-3" />
                        )}
                        {state === 'done' ? 'Done' : state === 'error' ? 'Error' : 'Reset'}
                      </button>
                      {resetResults[api.slug] && state !== 'idle' && (
                        <p className="text-xs text-gray-600 max-w-[160px] leading-tight">
                          {resetResults[api.slug]}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    operational: {
      label: 'Operational',
      className: 'bg-green-900/20 border-green-800/40 text-green-400',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    degraded: {
      label: 'Degraded',
      className: 'bg-yellow-900/20 border-yellow-800/40 text-yellow-400',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    down: {
      label: 'Down',
      className: 'bg-red-900/20 border-red-800/40 text-red-400',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    unknown: {
      label: 'Unknown',
      className: 'bg-gray-800 border-white/10 text-gray-500',
      icon: <Minus className="w-3 h-3" />,
    },
  }
  const s = map[status] ?? map.unknown
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${s.className}`}>
      {s.icon}
      {s.label}
    </span>
  )
}
