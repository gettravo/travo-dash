'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ApiStatusCard from '@/components/dashboard/ApiStatusCard'
import { getApiStatus } from '@/lib/utils'
import type { ApiWithStatus } from '@/lib/queries'

interface Props {
  initialApis: ApiWithStatus[]
  stackName?: string | null
}

export default function StackDashboard({ initialApis, stackName }: Props) {
  const [apis, setApis] = useState<ApiWithStatus[]>(initialApis)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api-routes/status')
      if (!res.ok) return
      const all: ApiWithStatus[] = await res.json()
      const slugs = new Set(initialApis.map((a) => a.slug))
      setApis(all.filter((a) => slugs.has(a.slug)))
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // ignore
    }
  }, [initialApis])

  useEffect(() => {
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const issues = apis.filter((a) => {
    const s = getApiStatus(a.latestMetric, a.activeIncident)
    return s !== 'operational' && s !== 'unknown'
  })

  const displayName = stackName?.trim() || 'My Stack'

  return (
    <div className="space-y-6">
      {/* Stack name */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{displayName}</h2>
        <Link
          href="/stack/edit"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Edit stack →
        </Link>
      </div>

      {/* Status banner */}
      <div
        className={`rounded-xl border px-5 py-3 flex items-center gap-3 ${
          issues.length === 0
            ? 'bg-green-950/40 border-green-800/50'
            : 'bg-yellow-950/40 border-yellow-800/50'
        }`}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${issues.length === 0 ? 'bg-green-400' : 'bg-yellow-400'}`}
        />
        <p className={`text-sm font-medium ${issues.length === 0 ? 'text-green-300' : 'text-yellow-300'}`}>
          {issues.length === 0
            ? `All services in ${displayName} are operational`
            : `${issues.length} service${issues.length !== 1 ? 's' : ''} in ${displayName} experiencing issues`}
        </p>
        {lastUpdated && (
          <span className="ml-auto text-xs text-gray-600">Updated {lastUpdated}</span>
        )}
      </div>

      {/* API grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {apis.map((api) => (
          <ApiStatusCard key={api.id} api={api} />
        ))}
      </div>

      <div className="pt-4 border-t border-white/10">
        <p className="text-sm text-gray-600">
          Monitoring {apis.length} services
        </p>
      </div>
    </div>
  )
}
