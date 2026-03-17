import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

const UPTIME_HOURS_24 = 24
const UPTIME_HOURS_7D = 168

type UptimeRow = { apiId: string; total: bigint; successful: bigint }

// Single aggregated query instead of 2×N individual counts
async function getUptimeMap(hours: number): Promise<Map<string, number>> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const rows = await prisma.$queryRaw<UptimeRow[]>(Prisma.sql`
    SELECT
      "apiId",
      COUNT(*)::bigint                                          AS total,
      SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::bigint  AS successful
    FROM "Metric"
    WHERE timestamp >= ${since}
    GROUP BY "apiId"
  `)
  return new Map(
    rows.map((r) => [
      r.apiId,
      Number(r.total) > 0 ? (Number(r.successful) / Number(r.total)) * 100 : 0,
    ])
  )
}

export async function getAllApisWithStatus() {
  const [apis, uptimeMap] = await Promise.all([
    prisma.api.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        metrics: { orderBy: { timestamp: 'desc' }, take: 1 },
        incidents: {
          where: { resolvedAt: null },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    }),
    getUptimeMap(UPTIME_HOURS_24),
  ])

  return apis.map((api) => ({
    ...api,
    latestMetric: api.metrics[0] ?? null,
    activeIncident: api.incidents[0] ?? null,
    uptime24h: uptimeMap.get(api.id) ?? null,
  }))
}

export async function getApiBySlug(slug: string) {
  return prisma.api.findUnique({ where: { slug } })
}

export async function getMetricsForApi(slug: string, hours = 24) {
  const api = await prisma.api.findUnique({ where: { slug } })
  if (!api) return null

  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const metrics = await prisma.metric.findMany({
    where: { apiId: api.id, timestamp: { gte: since } },
    orderBy: { timestamp: 'asc' },
  })

  return { api, metrics }
}

export async function getApiDetail(slug: string) {
  const api = await prisma.api.findUnique({ where: { slug } })
  if (!api) return null

  const since24h = new Date(Date.now() - UPTIME_HOURS_24 * 60 * 60 * 1000)
  const since7d = new Date(Date.now() - UPTIME_HOURS_7D * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  // All queries in parallel — 4 total instead of 5+
  const [uptimeRows, metrics24h, incidents, allMetrics90d] = await Promise.all([
    prisma.$queryRaw<UptimeRow[]>(Prisma.sql`
      SELECT
        "apiId",
        COUNT(*)::bigint                                          AS total,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::bigint  AS successful
      FROM "Metric"
      WHERE "apiId" = ${api.id}
        AND timestamp >= ${since7d}
      GROUP BY "apiId", (timestamp >= ${since24h})
      -- returns up to 2 rows: one for 24h window, one for 7d-only window
    `),
    prisma.metric.findMany({
      where: { apiId: api.id, timestamp: { gte: since24h } },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.incident.findMany({
      where: { apiId: api.id },
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
    prisma.metric.findMany({
      where: { apiId: api.id, timestamp: { gte: ninetyDaysAgo } },
      select: { timestamp: true, success: true },
    }),
  ])

  // Compute uptime from metrics directly (avoids needing the complex grouped query above)
  const calc = (metrics: Array<{ success: boolean }>) =>
    metrics.length === 0 ? null : (metrics.filter((m) => m.success).length / metrics.length) * 100

  const metrics7d = allMetrics90d.filter((m) => m.timestamp >= since7d)
  const uptime24h = calc(metrics24h)
  const uptime7d = calc(metrics7d)

  // suppress unused var from raw query (kept for future use)
  void uptimeRows

  // 90-day daily uptime buckets — computed in-memory from already-fetched data
  const dailyBuckets: Array<{ date: string; uptime: number | null }> = []
  for (let i = 89; i >= 0; i--) {
    const dayStart = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
    const dayEnd = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dayMetrics = allMetrics90d.filter(
      (m) => m.timestamp >= dayStart && m.timestamp < dayEnd
    )
    dailyBuckets.push({
      date: dayStart.toISOString().split('T')[0],
      uptime: calc(dayMetrics),
    })
  }

  return { api, uptime24h, uptime7d, metrics24h, incidents, dailyBuckets }
}

export async function getIncidentsForApi(slug: string) {
  const api = await prisma.api.findUnique({ where: { slug } })
  if (!api) return []
  return prisma.incident.findMany({
    where: { apiId: api.id },
    orderBy: { startedAt: 'desc' },
    take: 20,
  })
}

export async function getRecentIncidents(limit = 20, days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return prisma.incident.findMany({
    where: { startedAt: { gte: since } },
    orderBy: { startedAt: 'desc' },
    take: limit,
    include: { api: { select: { name: true, slug: true, category: true } } },
  })
}

export type ApiWithStatus = Awaited<ReturnType<typeof getAllApisWithStatus>>[number]
export type ApiDetail = Awaited<ReturnType<typeof getApiDetail>>
