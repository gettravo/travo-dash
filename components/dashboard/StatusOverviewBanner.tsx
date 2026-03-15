import type { ApiWithStatus } from '@/lib/queries'
import { getApiStatus } from '@/lib/utils'

interface Props {
  apis: ApiWithStatus[]
}

export default function StatusOverviewBanner({ apis }: Props) {
  const incidents = apis.filter((api) => {
    const status = getApiStatus(api.latestMetric, api.activeIncident)
    return status !== 'operational' && status !== 'unknown'
  })

  const isAllOperational = incidents.length === 0

  return (
    <div
      className={`rounded-xl border px-6 py-4 flex items-center gap-3 ${
        isAllOperational
          ? 'bg-green-950/40 border-green-800/50'
          : 'bg-yellow-950/40 border-yellow-800/50'
      }`}
    >
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 ${
          isAllOperational ? 'bg-green-400' : 'bg-yellow-400'
        }`}
      />
      <div>
        {isAllOperational ? (
          <p className="text-green-300 font-medium">All systems operational</p>
        ) : (
          <p className="text-yellow-300 font-medium">
            {incidents.length} API{incidents.length !== 1 ? 's' : ''} experiencing issues
          </p>
        )}
        <p className="text-sm text-gray-500 mt-0.5">
          Monitoring {apis.length} APIs · Updated every 30s
        </p>
      </div>
    </div>
  )
}
