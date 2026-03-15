import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getApiDetail } from '@/lib/queries'
import { getApiStatus, bucketMetrics } from '@/lib/utils'
import ApiHeader from '@/components/detail/ApiHeader'
import UptimeSummary from '@/components/detail/UptimeSummary'
import LatencyChart from '@/components/detail/LatencyChart'
import ErrorRateChart from '@/components/detail/ErrorRateChart'
import IncidentList from '@/components/detail/IncidentList'
import UptimeBar from '@/components/detail/UptimeBar'

export const revalidate = 30

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ApiDetailPage({ params }: Props) {
  const { slug } = await params
  const detail = await getApiDetail(slug)

  if (!detail) notFound()

  const { api, uptime24h, uptime7d, metrics24h, incidents, dailyBuckets } = detail

  const latestMetric = metrics24h[metrics24h.length - 1] ?? null
  const activeIncident = incidents.find((i) => !i.resolvedAt) ?? null

  const bucketed = bucketMetrics(
    metrics24h.map((m) => ({
      timestamp: m.timestamp,
      latencyMs: m.latencyMs,
      success: m.success,
    }))
  )

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
        ← Back to dashboard
      </Link>

      <ApiHeader
        api={api}
        latestMetric={latestMetric}
        activeIncident={activeIncident}
      />

      <UptimeSummary uptime24h={uptime24h} uptime7d={uptime7d} />

      <UptimeBar dailyBuckets={dailyBuckets} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LatencyChart data={bucketed} />
        <ErrorRateChart data={bucketed} />
      </div>

      <IncidentList incidents={incidents} />
    </div>
  )
}
