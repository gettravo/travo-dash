'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Globe, Smartphone, CheckCircle, Loader2, ExternalLink } from 'lucide-react'

interface AlertSettingsData {
  emailEnabled?: boolean
  email?: string | null
  webhookEnabled?: boolean
  webhookUrl?: string | null
  hooktapEnabled?: boolean
  hooktapId?: string | null
}

export default function AlertSettingsForm({ userId }: { userId: string }) {
  const [settings, setSettings] = useState<AlertSettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api-routes/alerts')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api-routes/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  function update(patch: Partial<AlertSettingsData>) {
    setSettings((prev) => ({ ...prev, ...patch }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Email (Maileroo) */}
      <IntegrationCard
        icon={<Mail className="w-5 h-5 text-blue-400" />}
        title="Email"
        description="Get notified by email when incidents are detected."
        enabled={settings.emailEnabled ?? false}
        onToggle={(v) => update({ emailEnabled: v })}
      >
        <label className="block">
          <span className="text-xs text-gray-500 mb-1.5 block">Email address</span>
          <input
            type="email"
            value={settings.email ?? ''}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
        </label>
      </IntegrationCard>

      {/* Webhook */}
      <IntegrationCard
        icon={<Globe className="w-5 h-5 text-purple-400" />}
        title="Webhook"
        description="POST incident data to your own endpoint. Works with n8n, Zapier, Make, or any HTTP endpoint."
        enabled={settings.webhookEnabled ?? false}
        onToggle={(v) => update({ webhookEnabled: v })}
      >
        <label className="block">
          <span className="text-xs text-gray-500 mb-1.5 block">Webhook URL</span>
          <input
            type="url"
            value={settings.webhookUrl ?? ''}
            onChange={(e) => update({ webhookUrl: e.target.value })}
            placeholder="https://your-service.com/webhook"
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
        </label>
        <div className="mt-3 bg-gray-800/60 border border-white/8 rounded-lg p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-400 mb-1">Payload format</p>
          <pre className="font-mono text-gray-500 overflow-auto">{`{
  "type": "incident",
  "api": "openai",
  "severity": "critical",
  "message": "API is down",
  "startedAt": "2024-01-01T00:00:00Z"
}`}</pre>
        </div>
      </IntegrationCard>

      {/* HookTap */}
      <IntegrationCard
        icon={<Smartphone className="w-5 h-5 text-green-400" />}
        title="HookTap — iPhone Push Notifications"
        description="Receive instant iPhone push notifications via HookTap. Get alerts directly on your lock screen or Dynamic Island."
        enabled={settings.hooktapEnabled ?? false}
        onToggle={(v) => update({ hooktapEnabled: v })}
        badge={
          <a
            href="https://hooktap.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
          >
            hooktap.me <ExternalLink className="w-3 h-3" />
          </a>
        }
      >
        <label className="block">
          <span className="text-xs text-gray-500 mb-1.5 block">HookTap Hook ID</span>
          <input
            type="text"
            value={settings.hooktapId ?? ''}
            onChange={(e) => update({ hooktapId: e.target.value })}
            placeholder="YOUR_HOOK_ID"
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20"
          />
        </label>
        <p className="mt-2 text-xs text-gray-600">
          Install HookTap from the App Store and find your Hook ID in the app settings.
        </p>
        <div className="mt-3 bg-gray-800/60 border border-white/8 rounded-lg p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-400 mb-1">How it works</p>
          <p>
            When an incident is detected, Travo sends a push notification to your iPhone via{' '}
            <code className="text-green-400">hooks.hooktap.me/webhook/{'<YOUR_HOOK_ID>'}</code>
          </p>
        </div>
      </IntegrationCard>

      {/* Coming soon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComingSoonCard title="Slack" icon="💬" />
        <ComingSoonCard title="Discord" icon="🎮" />
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-4 h-4 text-green-300" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}

function IntegrationCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
  badge,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
  onToggle: (v: boolean) => void
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      className={`bg-gray-900 border rounded-xl p-5 transition-colors ${
        enabled ? 'border-blue-800/50' : 'border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              {badge}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 max-w-md">{description}</p>
          </div>
        </div>
        {/* Toggle switch */}
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enabled && <div className="space-y-3">{children}</div>}
    </div>
  )
}

function ComingSoonCard({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="bg-gray-900/50 border border-white/5 rounded-xl p-4 opacity-60">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-sm font-medium text-gray-400">{title}</span>
        <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
          Coming soon
        </span>
      </div>
    </div>
  )
}
