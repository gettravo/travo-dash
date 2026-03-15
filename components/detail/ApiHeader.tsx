import type { Api, Metric, Incident } from '@prisma/client'
import { getApiStatus, statusBg, statusLabel } from '@/lib/utils'

interface Props {
  api: Api
  latestMetric: Metric | null
  activeIncident: Incident | null
}

export default function ApiHeader({ api, latestMetric, activeIncident }: Props) {
  const status = getApiStatus(latestMetric, activeIncident)
  const dotColor = statusBg(status)

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{api.name}</h1>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
            <span className="text-sm text-gray-400">{statusLabel(status)}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1">{api.category}</p>
      </div>
    </div>
  )
}
