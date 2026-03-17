import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, Key, Download, BarChart3, ExternalLink } from 'lucide-react'
import PasswordChangeForm from '@/components/settings/PasswordChangeForm'
import DeleteAccountButton from '@/components/settings/DeleteAccountButton'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const isOAuthUser = user.app_metadata?.provider === 'google'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account</h2>
        <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent-600/20 border border-accent-600/30 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.email}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-gray-500">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
                {isOAuthUser && (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-white/8">
                    Google
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Change Password — only for email/password users */}
      {!isOAuthUser && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Change Password
          </h2>
          <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
            <PasswordChangeForm />
          </div>
        </section>
      )}

      {/* Developer */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Developer</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white">Status API</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Programmatic access to API status and metrics data.
                </p>
                <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-400">
                  GET /api-routes/status
                </div>
                <div className="mt-2 bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-400">
                  GET /api-routes/metrics/[slug]
                </div>
                <div className="mt-2 bg-gray-800 rounded-lg px-3 py-2 font-mono text-xs text-gray-400">
                  GET /api-routes/incidents/[slug]
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-white">Data Export</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Export your monitoring data and stack configuration.
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href="/api-routes/status"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent-400 hover:text-accent-300 bg-gray-800 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export status JSON <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-white/5 rounded-xl p-5 opacity-60">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-400">SLA Reports</h3>
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  Generate SLA compliance reports for your monitored APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications shortcut */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Notifications
        </h2>
        <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-400">
            Configure email, webhook, and HookTap notifications in{' '}
            <Link href="/alerts" className="text-accent-400 hover:text-accent-300">
              Alert Settings
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-red-400/70 uppercase tracking-wider">
          Danger Zone
        </h2>
        <div className="bg-gray-900 border border-red-900/30 rounded-xl p-5 space-y-4">
          <div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign out of all devices
              </button>
            </form>
          </div>
          <div className="border-t border-red-900/20 pt-4">
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </div>
  )
}
