'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ApiWithStatus } from '@/lib/queries'

const ALL_APIS = [
  { slug: 'openai', name: 'OpenAI', category: 'AI' },
  { slug: 'anthropic', name: 'Anthropic', category: 'AI' },
  { slug: 'huggingface', name: 'HuggingFace', category: 'AI' },
  { slug: 'replicate', name: 'Replicate', category: 'AI' },
  { slug: 'stripe', name: 'Stripe', category: 'Payments' },
  { slug: 'braintree', name: 'Braintree', category: 'Payments' },
  { slug: 'paypal', name: 'PayPal', category: 'Payments' },
  { slug: 'github', name: 'GitHub', category: 'DevTools' },
  { slug: 'vercel', name: 'Vercel', category: 'Cloud' },
  { slug: 'cloudflare', name: 'Cloudflare', category: 'Cloud' },
  { slug: 'railway', name: 'Railway', category: 'Cloud' },
  { slug: 'flyio', name: 'Fly.io', category: 'Cloud' },
  { slug: 'supabase', name: 'Supabase', category: 'Database' },
  { slug: 'planetscale', name: 'PlanetScale', category: 'Database' },
  { slug: 'neon', name: 'Neon', category: 'Database' },
  { slug: 'upstash', name: 'Upstash', category: 'Database' },
  { slug: 'firebase', name: 'Firebase', category: 'Database' },
  { slug: 'auth0', name: 'Auth0', category: 'Auth' },
  { slug: 'resend', name: 'Resend', category: 'Communication' },
  { slug: 'sendgrid', name: 'SendGrid', category: 'Communication' },
  { slug: 'twilio', name: 'Twilio', category: 'Communication' },
  { slug: 'slack', name: 'Slack', category: 'Communication' },
  { slug: 'discord', name: 'Discord', category: 'Communication' },
  { slug: 'notion', name: 'Notion', category: 'Productivity' },
  { slug: 'linear', name: 'Linear', category: 'Productivity' },
  { slug: 'shopify', name: 'Shopify', category: 'Commerce' },
]

interface Props {
  initialSlugs: string[]
  allApis: ApiWithStatus[]
}

type Tab = 'detect' | 'manual'

export default function StackSetup({ initialSlugs, allApis }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('detect')
  const [repoUrl, setRepoUrl] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [detectedSlugs, setDetectedSlugs] = useState<string[] | null>(null)
  const [detectedSources, setDetectedSources] = useState<Record<string, string[]>>({})
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set(initialSlugs))
  const [saving, setSaving] = useState(false)

  async function handleDetect() {
    setDetecting(true)
    setDetectError(null)
    setDetectedSlugs(null)

    try {
      const res = await fetch('/api-routes/detect-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDetectError(data.error ?? 'Detection failed')
        return
      }
      setDetectedSlugs(data.slugs)
      setDetectedSources(data.sources)
      // Pre-select all detected slugs (merging with existing)
      setSelectedSlugs((prev) => new Set([...prev, ...data.slugs]))
    } catch {
      setDetectError('Network error — please try again')
    } finally {
      setDetecting(false)
    }
  }

  function toggleSlug(slug: string) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api-routes/stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiSlugs: Array.from(selectedSlugs) }),
      })
      router.push('/stack')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const categories = Array.from(new Set(ALL_APIS.map((a) => a.category)))

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-white/10 rounded-lg p-1 w-fit">
        {(['detect', 'manual'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'detect' ? 'Auto-detect from GitHub' : 'Pick manually'}
          </button>
        ))}
      </div>

      {/* Auto-detect panel */}
      {tab === 'detect' && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-400 mb-3">
              Paste a public GitHub repository URL. Travo will scan{' '}
              <code className="text-blue-400 text-xs">package.json</code>,{' '}
              <code className="text-blue-400 text-xs">requirements.txt</code>,{' '}
              <code className="text-blue-400 text-xs">Pipfile</code>,{' '}
              <code className="text-blue-400 text-xs">Gemfile</code>, and more to detect
              which APIs your project uses.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="flex-1 bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleDetect}
                disabled={detecting || !repoUrl.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {detecting ? 'Scanning…' : 'Detect'}
              </button>
            </div>
            {detectError && <p className="text-sm text-red-400 mt-2">{detectError}</p>}
          </div>

          {detectedSlugs !== null && (
            <div>
              {detectedSlugs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No recognised APIs found. Try picking manually or check a different repo.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Found <span className="text-white font-medium">{detectedSlugs.length}</span>{' '}
                    APIs. Uncheck any you don't want to track.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detectedSlugs.map((slug) => {
                      const api = ALL_APIS.find((a) => a.slug === slug)
                      const checked = selectedSlugs.has(slug)
                      return (
                        <button
                          key={slug}
                          onClick={() => toggleSlug(slug)}
                          title={detectedSources[slug]?.join(', ')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            checked
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                              : 'bg-gray-800 border-white/10 text-gray-500 line-through'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${checked ? 'bg-blue-400' : 'bg-gray-600'}`}
                          />
                          {api?.name ?? slug}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual selection panel */}
      {tab === 'manual' && (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {ALL_APIS.filter((a) => a.category === cat).map((api) => {
                  const checked = selectedSlugs.has(api.slug)
                  return (
                    <button
                      key={api.slug}
                      onClick={() => toggleSlug(api.slug)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        checked
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-gray-900 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {api.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected count + save */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <p className="text-sm text-gray-500">
          {selectedSlugs.size > 0 ? (
            <>
              <span className="text-white font-medium">{selectedSlugs.size}</span> APIs selected
            </>
          ) : (
            'No APIs selected'
          )}
        </p>
        <button
          onClick={handleSave}
          disabled={saving || selectedSlugs.size === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save My Stack'}
        </button>
      </div>
    </div>
  )
}
