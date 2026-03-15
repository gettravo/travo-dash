import { prisma } from './prisma'

const UPTIME_HOURS_24 = 24
const UPTIME_HOURS_7D = 168

async function getUptimePercent(apiId: string, hours: number): Promise<number | null> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const [total, successful] = await Promise.all([
    prisma.metric.count({ where: { apiId, timestamp: { gte: since } } }),
    prisma.metric.count({ where: { apiId, timestamp: { gte: since }, success: true } }),
  ])
  if (total === 0) return null
  return (successful / total) * 100
}

export async function getAllApisWithStatus() {
  const apis = await prisma.api.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      metrics: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
      incidents: {
        where: { resolvedAt: null },
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
  })

  const results = await Promise.all(
    apis.map(async (api) => {
      const uptime24h = await getUptimePercent(api.id, UPTIME_HOURS_24)
      return {
        ...api,
        latestMetric: api.metrics[0] ?? null,
        activeIncident: api.incidents[0] ?? null,
        uptime24h,
      }
    })
  )

  return results
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

  const [uptime24h, uptime7d, metrics24h, incidents] = await Promise.all([
    getUptimePercent(api.id, UPTIME_HOURS_24),
    getUptimePercent(api.id, UPTIME_HOURS_7D),
    prisma.metric.findMany({
      where: { apiId: api.id, timestamp: { gte: since24h } },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.incident.findMany({
      where: { apiId: api.id },
      orderBy: { startedAt: 'desc' },
      take: 20,
    }),
  ])

  // 90-day daily uptime buckets
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const allMetrics90d = await prisma.metric.findMany({
    where: { apiId: api.id, timestamp: { gte: ninetyDaysAgo } },
    select: { timestamp: true, success: true },
  })

  const dailyBuckets: Array<{ date: string; uptime: number | null }> = []
  for (let i = 89; i >= 0; i--) {
    const dayStart = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
    const dayEnd = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dayMetrics = allMetrics90d.filter(
      (m) => m.timestamp >= dayStart && m.timestamp < dayEnd
    )
    const uptime =
      dayMetrics.length === 0
        ? null
        : (dayMetrics.filter((m) => m.success).length / dayMetrics.length) * 100
    dailyBuckets.push({ date: dayStart.toISOString().split('T')[0], uptime })
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

export type ApiWithStatus = Awaited<ReturnType<typeof getAllApisWithStatus>>[number]
export type ApiDetail = Awaited<ReturnType<typeof getApiDetail>>
