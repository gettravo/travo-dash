import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AlertSettingsForm from '@/components/alerts/AlertSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AlertsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-gray-500 mt-1">
          Get notified when APIs go down, show high error rates, or have unusual latency.
        </p>
      </div>

      {/* Trigger conditions */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Alert Triggers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'API Downtime', desc: '3 consecutive failed checks', color: 'text-red-400' },
            { label: 'High Error Rate', desc: 'Error rate exceeds 20%', color: 'text-yellow-400' },
            { label: 'Latency Spike', desc: 'Latency exceeds threshold', color: 'text-orange-400' },
          ].map(({ label, desc, color }) => (
            <div
              key={label}
              className="flex items-start gap-2 bg-gray-800/50 rounded-lg px-3 py-2.5"
            >
              <span className={`text-sm ${color} mt-0.5`}>●</span>
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert channels */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Notification Channels
        </h2>
        <AlertSettingsForm userId={user.id} />
      </div>
    </div>
  )
}
