import type { Incident } from '@prisma/client'
import { formatTimeAgo } from '@/lib/utils'

interface Props {
  incidents: Incident[]
}

const typeLabel: Record<string, string> = {
  downtime: 'Downtime',
  error_rate: 'Error rate',
  latency: 'Latency spike',
}

const severityStyles: Record<string, string> = {
  critical: 'bg-red-950/50 text-red-400 border-red-800/50',
  warning: 'bg-yellow-950/50 text-yellow-400 border-yellow-800/50',
}

export default function IncidentList({ incidents }: Props) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Incidents</h3>
      {incidents.length === 0 ? (
        <p className="text-sm text-gray-600">No incidents recorded.</p>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`border rounded-lg px-4 py-3 ${severityStyles[incident.severity] ?? 'bg-gray-800 border-gray-700 text-gray-400'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider">
                  {typeLabel[incident.type] ?? incident.type}
                </span>
                <div className="flex items-center gap-2 text-xs opacity-60">
                  {incident.resolvedAt ? (
                    <span className="text-green-400">Resolved {formatTimeAgo(incident.resolvedAt)}</span>
                  ) : (
                    <span className="text-red-400 font-medium">Active</span>
                  )}
                  <span>{formatTimeAgo(incident.startedAt)}</span>
                </div>
              </div>
              <p className="text-sm mt-1 opacity-80">{incident.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
