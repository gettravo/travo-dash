'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type { ApiWithStatus } from '@/lib/queries'
import { getApiStatus, statusBg, statusLabel, formatLatency, formatUptime } from '@/lib/utils'
import { Search, RefreshCw } from 'lucide-react'

interface Props {
  initialApis: ApiWithStatus[]
}

const STATUS_FILTERS = ['All', 'Operational', 'Degraded', 'Down'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

export default function ServiceGrid({ initialApis }: Props) {
  const [apis, setApis] = useState<ApiWithStatus[]>(initialApis)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(initialApis.map((a) => a.category))).sort()],
    [initialApis]
  )

  const fetchStatus = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const res = await fetch('/api-routes/status')
      if (!res.ok) return
      const data = await res.json()
      setApis(data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // silently ignore
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const filtered = useMemo(() => {
    return apis.filter((api) => {
      const status = getApiStatus(api.latestMetric, api.activeIncident)

      if (search && !api.name.toLowerCase().includes(search.toLowerCase())) return false

      if (statusFilter !== 'All') {
        const label = statusLabel(status)
        if (label !== statusFilter) return false
      }

      if (categoryFilter !== 'All' && api.category !== categoryFilter) return false

      return true
    })
  }, [apis, search, statusFilter, categoryFilter])

  const grouped = useMemo(() => {
    const cats = Array.from(new Set(filtered.map((a) => a.category))).sort()
    return cats.map((cat) => ({
      cat,
      apis: filtered.filter((a) => a.category === cat),
    }))
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-accent-600 text-white'
                  : 'bg-gray-900 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-gray-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-400 focus:outline-none focus:border-accent-500/50"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={fetchStatus}
          disabled={isRefreshing}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {lastUpdated ? `Updated ${lastUpdated}` : 'Refresh'}
        </button>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-600">
        {filtered.length} of {apis.length} services
      </p>

      {/* Grid */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">No services match your filters.</p>
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('All')
              setCategoryFilter('All')
            }}
            className="mt-3 text-xs text-accent-400 hover:text-accent-300 underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ cat, apis: catApis }) => (
            <section key={cat}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catApis.map((api) => (
                  <ServiceCard key={api.id} api={api} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function ServiceCard({ api }: { api: ApiWithStatus }) {
  const status = getApiStatus(api.latestMetric, api.activeIncident)
  const dotColor = statusBg(status)

  return (
    <Link
      href={`/api/${api.slug}`}
      className="block bg-gray-900 border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-gray-800/80 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-white truncate">{api.name}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-xs text-gray-400">{statusLabel(status)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Uptime 24h</p>
          <p className="text-sm font-mono text-gray-300">{formatUptime(api.uptime24h)}</p>
        </div>
        {api.latestMetric && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Latency</p>
            <p className="text-sm font-mono text-gray-300">
              {formatLatency(api.latestMetric.latencyMs)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2">
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
          {api.category}
        </span>
      </div>
    </Link>
  )
}
