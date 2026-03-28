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

  // Use raw SQL to get daily aggregates for the 90-day chart
  // This reduces the returned data from ~20,000 rows to 90 rows.
  const [metrics24h, incidents, dailyStats] = await Promise.all([
    prisma.metric.findMany({
      where: { apiId: api.id, timestamp: { gte: since24h } },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.incident.findMany({
      where: { apiId: api.id },
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
    prisma.$queryRaw<Array<{ date: string; total: bigint; successful: bigint }>>(Prisma.sql`
      SELECT
        TO_CHAR(timestamp, 'YYYY-MM-DD') as date,
        COUNT(*)::bigint as total,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::bigint as successful
      FROM "Metric"
      WHERE "apiId" = ${api.id} AND timestamp >= ${ninetyDaysAgo}
      GROUP BY TO_CHAR(timestamp, 'YYYY-MM-DD')
      ORDER BY date ASC
    `),
  ])

  const calc = (total: bigint, successful: bigint) =>
    Number(total) === 0 ? null : (Number(successful) / Number(total)) * 100

  // Calculate 24h and 7d uptime from dailyStats to avoid extra queries
  const stats24h = dailyStats.find(s => s.date === new Date().toISOString().split('T')[0])
  const uptime24h = stats24h ? calc(stats24h.total, stats24h.successful) : null

  const stats7d = dailyStats.filter(s => new Date(s.date) >= since7d)
  const total7d = stats7d.reduce((acc, s) => acc + s.total, BigInt(0))
  const successful7d = stats7d.reduce((acc, s) => acc + s.successful, BigInt(0))
  const uptime7d = calc(total7d, successful7d)

  // Fill in gaps for the 90-day daily buckets
  const dailyBuckets: Array<{ date: string; uptime: number | null }> = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    const stat = dailyStats.find(s => s.date === dateStr)
    dailyBuckets.push({
      date: dateStr,
      uptime: stat ? calc(stat.total, stat.successful) : null,
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
