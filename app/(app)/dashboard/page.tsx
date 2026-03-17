import { getAllApisWithStatus, getRecentIncidents } from '@/lib/queries'
import { getApiStatus } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Activity, AlertTriangle, CheckCircle, XCircle, Layers, ChevronRight, PartyPopper } from 'lucide-react'
import StatusOverviewBanner from '@/components/dashboard/StatusOverviewBanner'
import { formatTimeAgo } from '@/lib/utils'

export const revalidate = 30

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const { welcome } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [apis, recentIncidents] = await Promise.all([
    getAllApisWithStatus(),
    getRecentIncidents(8),
  ])

  let stackApis: typeof apis = []
  if (user) {
    const userStack = await prisma.userStack.findUnique({ where: { userId: user.id } })
    const savedSlugs = userStack?.apiSlugs ?? []
    stackApis = apis.filter((a) => savedSlugs.includes(a.slug))
  }

  const statuses = apis.map((a) => getApiStatus(a.latestMetric, a.activeIncident))
  const operational = statuses.filter((s) => s === 'operational').length
  const degraded = statuses.filter((s) => s === 'degraded').length
  const down = statuses.filter((s) => s === 'down').length
  const activeIncidents = recentIncidents.filter((i) => !i.resolvedAt)

  return (
    <div className="space-y-8">
      {welcome === '1' && (
        <div className="flex items-center gap-3 bg-green-950/40 border border-green-800/50 rounded-xl px-5 py-3 animate-fade-in">
          <PartyPopper className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300 font-medium">You're all set! Travo is now monitoring your stack.</p>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all monitored APIs and active incidents.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5 text-accent-400" />}
          label="Total APIs"
          value={apis.length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
          label="Operational"
          value={operational}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
          label="Degraded"
          value={degraded}
          color="yellow"
        />
        <StatCard
          icon={<XCircle className="w-5 h-5 text-red-400" />}
          label="Down"
          value={down}
          color="red"
        />
      </div>

      {/* Overall status banner */}
      <StatusOverviewBanner apis={apis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Recent Incidents
            </h2>
            <Link href="/incidents" className="text-xs text-accent-400 hover:text-accent-300">
              View all →
            </Link>
          </div>
          {recentIncidents.length === 0 ? (
            <div className="bg-gray-900 border border-white/10 rounded-xl p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No incidents in the last 7 days</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/api/${incident.api.slug}`}
                  className="block bg-gray-900 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            incident.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-400'
                          }`}
                        />
                        <span className="text-sm font-medium text-white truncate">
                          {incident.api.name}
                        </span>
                        {!incident.resolvedAt && (
                          <span className="text-xs bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded-full border border-red-800/50">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-4 truncate">
                        {incident.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      {formatTimeAgo(incident.startedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Stack */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              My Stack
            </h2>
            <Link href="/stack" className="text-xs text-accent-400 hover:text-accent-300">
              Manage →
            </Link>
          </div>
          {!user ? (
            <div className="bg-gray-900 border border-white/10 rounded-xl p-6 text-center">
              <Layers className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-3">Sign in to monitor your personal stack</p>
              <Link
                href="/auth/login"
                className="text-xs text-accent-400 hover:text-accent-300 underline"
              >
                Sign in
              </Link>
            </div>
          ) : stackApis.length === 0 ? (
            <div className="bg-gray-900 border border-white/10 rounded-xl p-6 text-center">
              <Layers className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-3">No APIs in your stack yet</p>
              <Link
                href="/stack/edit"
                className="text-xs text-accent-400 hover:text-accent-300 underline"
              >
                Set up your stack →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stackApis.slice(0, 6).map((api) => {
                const status = getApiStatus(api.latestMetric, api.activeIncident)
                const dotColor =
                  status === 'operational'
                    ? 'bg-green-500'
                    : status === 'degraded'
                      ? 'bg-yellow-400'
                      : status === 'down'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                return (
                  <Link
                    key={api.id}
                    href={`/api/${api.slug}`}
                    className="flex items-center justify-between bg-gray-900 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="text-sm text-white">{api.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {api.latestMetric && (
                        <span className="text-xs text-gray-500 font-mono">
                          {api.latestMetric.latencyMs}ms
                        </span>
                      )}
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                  </Link>
                )
              })}
              {stackApis.length > 6 && (
                <Link
                  href="/stack"
                  className="block text-center text-xs text-gray-500 hover:text-gray-300 py-2"
                >
                  +{stackApis.length - 6} more
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const border = {
    blue: 'border-accent-800/30',
    green: 'border-green-800/30',
    yellow: 'border-yellow-800/30',
    red: 'border-red-800/30',
  }[color]

  return (
    <div className={`bg-gray-900 border ${border} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
