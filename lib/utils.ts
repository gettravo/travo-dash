import type { Metric, Incident } from '@prisma/client'

export type ApiStatus = 'operational' | 'degraded' | 'down' | 'unknown'

export function getApiStatus(
  latestMetric: Pick<Metric, 'success'> | null,
  activeIncident: Pick<Incident, 'severity' | 'type'> | null
): ApiStatus {
  if (!latestMetric) return 'unknown'
  if (!latestMetric.success) return 'down'
  if (activeIncident?.severity === 'critical') return 'down'
  if (activeIncident) return 'degraded'
  return 'operational'
}

export function statusColor(status: ApiStatus): string {
  switch (status) {
    case 'operational':
      return 'text-green-500'
    case 'degraded':
      return 'text-yellow-400'
    case 'down':
      return 'text-red-500'
    default:
      return 'text-gray-400'
  }
}

export function statusBg(status: ApiStatus): string {
  switch (status) {
    case 'operational':
      return 'bg-green-500'
    case 'degraded':
      return 'bg-yellow-400'
    case 'down':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

export function statusLabel(status: ApiStatus): string {
  switch (status) {
    case 'operational':
      return 'Operational'
    case 'degraded':
      return 'Degraded'
    case 'down':
      return 'Down'
    default:
      return 'No data'
  }
}

export function uptimeBg(uptime: number | null): string {
  if (uptime === null) return 'bg-gray-700'
  if (uptime >= 99) return 'bg-green-500'
  if (uptime >= 90) return 'bg-yellow-400'
  return 'bg-red-500'
}

export interface BucketedMetric {
  time: string
  avgLatency: number
  errorRate: number
  count: number
}

export function bucketMetrics(
  metrics: Array<{ timestamp: Date; latencyMs: number; success: boolean }>,
  bucketMinutes = 5
): BucketedMetric[] {
  const buckets = new Map<number, typeof metrics>()
  const bucketMs = bucketMinutes * 60 * 1000

  for (const metric of metrics) {
    const bucketTime = Math.floor(metric.timestamp.getTime() / bucketMs) * bucketMs
    if (!buckets.has(bucketTime)) buckets.set(bucketTime, [])
    buckets.get(bucketTime)!.push(metric)
  }

  return Array.from(buckets.entries())
    .map(([time, items]) => ({
      time: new Date(time).toISOString(),
      avgLatency: Math.round(items.reduce((s, m) => s + m.latencyMs, 0) / items.length),
      errorRate: items.filter((m) => !m.success).length / items.length,
      count: items.length,
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

export function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

export function formatUptime(pct: number | null): string {
  if (pct === null) return '—'
  return `${pct.toFixed(2)}%`
}

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
