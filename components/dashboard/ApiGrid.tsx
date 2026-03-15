'use client'

import { useEffect, useState, useCallback } from 'react'
import ApiStatusCard from './ApiStatusCard'
import type { ApiWithStatus } from '@/lib/queries'

interface Props {
  initialApis: ApiWithStatus[]
}

export default function ApiGrid({ initialApis }: Props) {
  const [apis, setApis] = useState<ApiWithStatus[]>(initialApis)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api-routes/status')
      if (!res.ok) return
      const data = await res.json()
      setApis(data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // silently ignore network errors
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  // Group by category
  const categories = Array.from(new Set(apis.map((a) => a.category))).sort()

  return (
    <div className="space-y-10">
      {lastUpdated && (
        <p className="text-xs text-gray-600 text-right">Updated {lastUpdated}</p>
      )}
      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {apis
              .filter((a) => a.category === cat)
              .map((api) => (
                <ApiStatusCard key={api.id} api={api} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
