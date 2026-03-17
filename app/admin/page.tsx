import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getAllApisWithStatus } from '@/lib/queries'
import { getApiStatus } from '@/lib/utils'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const { secret } = await searchParams

  // Protect via query param on first visit, then cookie
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret || secret !== adminSecret) {
    // Allow if ?secret= matches
    if (secret !== adminSecret) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 font-medium mb-2">Access denied</p>
            <p className="text-sm text-gray-500">Pass ?secret=YOUR_ADMIN_SECRET in the URL</p>
          </div>
        </div>
      )
    }
  }

  const apis = await getAllApisWithStatus()

  const rows = apis.map((api) => ({
    id: api.id,
    name: api.name,
    slug: api.slug,
    category: api.category,
    status: getApiStatus(api.latestMetric, api.activeIncident),
    latencyMs: api.latestMetric?.latencyMs ?? null,
    uptime24h: api.uptime24h,
    activeIncident: api.activeIncident
      ? { type: api.activeIncident.type, severity: api.activeIncident.severity }
      : null,
  }))

  const totalUsers = await prisma.alertSettings.count()
  const totalIncidents = await prisma.incident.count({ where: { resolvedAt: null } })
  const totalMetrics = await prisma.metric.count()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Travo internal — keep this URL private</p>
          </div>
          <span className="text-xs bg-red-900/40 border border-red-800/50 text-red-400 px-3 py-1 rounded-full">
            Admin
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'APIs monitored', value: apis.length },
            { label: 'Active incidents', value: totalIncidents },
            { label: 'Alert subscribers', value: totalUsers },
            { label: 'Total metrics', value: totalMetrics.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-white/10 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <AdminDashboardClient apis={rows} adminSecret={secret!} />
      </div>
    </div>
  )
}
