import { getRecentIncidents } from '@/lib/queries'
import Link from 'next/link'
import { formatTimeAgo } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

export const revalidate = 30

const TYPE_LABELS: Record<string, string> = {
  downtime: 'Downtime',
  error_rate: 'Error Rate',
  latency: 'Latency Spike',
}

export default async function IncidentsPage() {
  const incidents = await getRecentIncidents(50)

  const active = incidents.filter((i) => !i.resolvedAt)
  const resolved = incidents.filter((i) => i.resolvedAt)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Incidents</h1>
        <p className="text-gray-500 mt-1">Detected incidents across all monitored APIs.</p>
      </div>

      {/* Active Incidents */}
      {active.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Active ({active.length})
          </h2>
          <div className="space-y-2">
            {active.map((incident) => (
              <IncidentRow key={incident.id} incident={incident} />
            ))}
          </div>
        </section>
      )}

      {/* Resolved */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          {active.length > 0 ? 'Resolved' : 'Recent Incidents'}
        </h2>
        {resolved.length === 0 && active.length === 0 ? (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-12 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <p className="text-white font-medium">No incidents detected</p>
            <p className="text-sm text-gray-500 mt-1">All systems are operating normally.</p>
          </div>
        ) : resolved.length === 0 ? null : (
          <div className="space-y-2">
            {resolved.map((incident) => (
              <IncidentRow key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function IncidentRow({
  incident,
}: {
  incident: Awaited<ReturnType<typeof getRecentIncidents>>[number]
}) {
  const isActive = !incident.resolvedAt
  const duration =
    incident.resolvedAt
      ? formatDuration(incident.startedAt, incident.resolvedAt)
      : null

  return (
    <Link
      href={`/api/${incident.api.slug}`}
      className="block bg-gray-900 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
              incident.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-400'
            }`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white">{incident.api.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  incident.severity === 'critical'
                    ? 'bg-red-900/30 text-red-300 border-red-800/50'
                    : 'bg-yellow-900/30 text-yellow-300 border-yellow-800/50'
                }`}
              >
                {incident.severity}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-white/10">
                {TYPE_LABELS[incident.type] ?? incident.type}
              </span>
              {isActive && (
                <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full border border-red-800/50 animate-pulse">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">{incident.message}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 text-xs text-gray-500">
          <p>{formatTimeAgo(incident.startedAt)}</p>
          {duration && <p className="mt-0.5">Duration: {duration}</p>}
          {incident.resolvedAt && (
            <p className="mt-0.5 text-green-500">Resolved</p>
          )}
        </div>
      </div>
    </Link>
  )
}

function formatDuration(start: Date, end: Date): string {
  const ms = end.getTime() - start.getTime()
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainMin = minutes % 60
  return remainMin > 0 ? `${hours}h ${remainMin}m` : `${hours}h`
}
