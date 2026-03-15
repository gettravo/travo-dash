import Link from 'next/link'
import type { ApiWithStatus } from '@/lib/queries'
import { getApiStatus, statusBg, statusLabel, formatLatency, formatUptime } from '@/lib/utils'

interface Props {
  api: ApiWithStatus
}

export default function ApiStatusCard({ api }: Props) {
  const status = getApiStatus(api.latestMetric, api.activeIncident)
  const dotColor = statusBg(status)

  return (
    <Link
      href={`/api/${api.slug}`}
      className="block bg-gray-900 border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-gray-800/80 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-white truncate">{api.name}</span>
        </div>
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
