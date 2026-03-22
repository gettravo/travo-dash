'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Loader2, ChevronDown, Crown } from 'lucide-react'
import Link from 'next/link'
import type { ApiWithStatus } from '@/lib/queries'
import type { GitHubRepo } from '@/lib/stack-detector'

const FREE_STACK_LIMIT = 5

const ALL_APIS = [
  { slug: 'openai', name: 'OpenAI', category: 'AI' },
  { slug: 'anthropic', name: 'Anthropic', category: 'AI' },
  { slug: 'huggingface', name: 'HuggingFace', category: 'AI' },
  { slug: 'replicate', name: 'Replicate', category: 'AI' },
  { slug: 'openrouter', name: 'OpenRouter', category: 'AI' },
  { slug: 'groq', name: 'Groq', category: 'AI' },
  { slug: 'mistral', name: 'Mistral AI', category: 'AI' },
  { slug: 'perplexity', name: 'Perplexity', category: 'AI' },
  { slug: 'elevenlabs', name: 'ElevenLabs', category: 'AI' },
  { slug: 'cohere', name: 'Cohere', category: 'AI' },
  { slug: 'together', name: 'Together AI', category: 'AI' },
  { slug: 'deepgram', name: 'Deepgram', category: 'AI' },
  { slug: 'assemblyai', name: 'AssemblyAI', category: 'AI' },
  { slug: 'falai', name: 'Fal.ai', category: 'AI' },
  { slug: 'stripe', name: 'Stripe', category: 'Payments' },
  { slug: 'braintree', name: 'Braintree', category: 'Payments' },
  { slug: 'paypal', name: 'PayPal', category: 'Payments' },
  { slug: 'revenuecat', name: 'RevenueCat', category: 'Payments' },
  { slug: 'paddle', name: 'Paddle', category: 'Payments' },
  { slug: 'lemonsqueezy', name: 'Lemon Squeezy', category: 'Payments' },
  { slug: 'plaid', name: 'Plaid', category: 'Payments' },
  { slug: 'mollie', name: 'Mollie', category: 'Payments' },
  { slug: 'github', name: 'GitHub', category: 'DevTools' },
  { slug: 'vercel', name: 'Vercel', category: 'Cloud' },
  { slug: 'cloudflare', name: 'Cloudflare', category: 'Cloud' },
  { slug: 'railway', name: 'Railway', category: 'Cloud' },
  { slug: 'flyio', name: 'Fly.io', category: 'Cloud' },
  { slug: 'render', name: 'Render', category: 'Cloud' },
  { slug: 'netlify', name: 'Netlify', category: 'Cloud' },
  { slug: 'aws', name: 'AWS', category: 'Cloud' },
  { slug: 'gcp', name: 'Google Cloud', category: 'Cloud' },
  { slug: 'azure', name: 'Azure', category: 'Cloud' },
  { slug: 'digitalocean', name: 'DigitalOcean', category: 'Cloud' },
  { slug: 'heroku', name: 'Heroku', category: 'Cloud' },
  { slug: 'supabase', name: 'Supabase', category: 'Database' },
  { slug: 'planetscale', name: 'PlanetScale', category: 'Database' },
  { slug: 'neon', name: 'Neon', category: 'Database' },
  { slug: 'upstash', name: 'Upstash', category: 'Database' },
  { slug: 'firebase', name: 'Firebase', category: 'Database' },
  { slug: 'mongodb', name: 'MongoDB Atlas', category: 'Database' },
  { slug: 'turso', name: 'Turso', category: 'Database' },
  { slug: 'convex', name: 'Convex', category: 'Database' },
  { slug: 'auth0', name: 'Auth0', category: 'Auth' },
  { slug: 'clerk', name: 'Clerk', category: 'Auth' },
  { slug: 'okta', name: 'Okta', category: 'Auth' },
  { slug: 'stytch', name: 'Stytch', category: 'Auth' },
  { slug: 'resend', name: 'Resend', category: 'Communication' },
  { slug: 'sendgrid', name: 'SendGrid', category: 'Communication' },
  { slug: 'twilio', name: 'Twilio', category: 'Communication' },
  { slug: 'postmark', name: 'Postmark', category: 'Communication' },
  { slug: 'mailgun', name: 'Mailgun', category: 'Communication' },
  { slug: 'pusher', name: 'Pusher', category: 'Communication' },
  { slug: 'ably', name: 'Ably', category: 'Communication' },
  { slug: 'slack', name: 'Slack', category: 'Communication' },
  { slug: 'discord', name: 'Discord', category: 'Communication' },
  { slug: 'algolia', name: 'Algolia', category: 'Search' },
  { slug: 'pinecone', name: 'Pinecone', category: 'Search' },
  { slug: 'sentry', name: 'Sentry', category: 'Monitoring' },
  { slug: 'datadog', name: 'Datadog', category: 'Monitoring' },
  { slug: 'posthog', name: 'PostHog', category: 'Analytics' },
  { slug: 'mixpanel', name: 'Mixpanel', category: 'Analytics' },
  { slug: 'amplitude', name: 'Amplitude', category: 'Analytics' },
  { slug: 'segment', name: 'Segment', category: 'Analytics' },
  { slug: 'mux', name: 'Mux', category: 'Media' },
  { slug: 'cloudinary', name: 'Cloudinary', category: 'Media' },
  { slug: 'backblaze', name: 'Backblaze B2', category: 'Media' },
  { slug: 'mapbox', name: 'Mapbox', category: 'Maps' },
  { slug: 'notion', name: 'Notion', category: 'Productivity' },
  { slug: 'linear', name: 'Linear', category: 'Productivity' },
  { slug: 'shopify', name: 'Shopify', category: 'Commerce' },
]

interface Props {
  initialSlugs: string[]
  initialName?: string | null
  allApis: ApiWithStatus[]
  onSave?: () => void
  redirectTo?: string
  isPro?: boolean
}

type Tab = 'detect' | 'manual'

export default function StackSetup({ initialSlugs, initialName, allApis, onSave, redirectTo, isPro = false }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('detect')
  const [stackName, setStackName] = useState(initialName ?? '')
  const [repoUrl, setRepoUrl] = useState('')
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState<string | null>(null)
  const [detectedSlugs, setDetectedSlugs] = useState<string[] | null>(null)
  const [detectedSources, setDetectedSources] = useState<Record<string, string[]>>({})
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set(initialSlugs))
  const [saving, setSaving] = useState(false)
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [showRepoDropdown, setShowRepoDropdown] = useState(false)

  useEffect(() => {
    if (tab === 'detect') {
      setLoadingRepos(true)
      fetch('/api-routes/detect-stack')
        .then((r) => r.json())
        .then((data) => {
          if (data.hasToken && data.repos) setGithubRepos(data.repos)
        })
        .catch(() => {})
        .finally(() => setLoadingRepos(false))
    }
  }, [tab])

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
      setSelectedSlugs((prev) => new Set([...prev, ...data.slugs]))
      if (data.repoName && !stackName) setStackName(data.repoName)
    } catch {
      setDetectError('Network error — please try again')
    } finally {
      setDetecting(false)
    }
  }

  function selectRepo(repo: GitHubRepo) {
    setRepoUrl(`https://github.com/${repo.fullName}`)
    setShowRepoDropdown(false)
    if (!stackName) setStackName(repo.name)
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
        body: JSON.stringify({
          apiSlugs: Array.from(selectedSlugs),
          name: stackName.trim() || null,
        }),
      })
      if (onSave) {
        onSave()
      } else {
        router.push(redirectTo ?? '/stack')
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const categories = Array.from(new Set(ALL_APIS.map((a) => a.category)))

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Stack name */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Stack name</label>
        <input
          type="text"
          value={stackName}
          onChange={(e) => setStackName(e.target.value)}
          placeholder="My Stack"
          className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent-500"
        />
        <p className="text-xs text-gray-600 mt-1">
          Give your stack a name, or leave blank for "My Stack".
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-white/10 rounded-lg p-1 w-fit">
        {(['detect', 'manual'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-accent-600 text-white'
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
              Paste a GitHub repository URL — Travo scans your dependency files to detect
              which APIs your project uses. Works with public and private repos.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 pr-10"
                />
                {githubRepos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowRepoDropdown((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {loadingRepos ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
                {showRepoDropdown && githubRepos.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-gray-900 border border-white/10 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                    {githubRepos.map((repo) => (
                      <button
                        key={repo.fullName}
                        type="button"
                        onClick={() => selectRepo(repo)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 text-gray-300"
                      >
                        <Github className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate">{repo.fullName}</span>
                        {repo.isPrivate && (
                          <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded flex-shrink-0">
                            Private
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleDetect}
                disabled={detecting || !repoUrl.trim()}
                className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
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
                              ? 'bg-accent-600/20 border-accent-500 text-accent-300'
                              : 'bg-gray-800 border-white/10 text-gray-500 line-through'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${checked ? 'bg-accent-400' : 'bg-gray-600'}`}
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
                          ? 'bg-accent-600/20 border-accent-500 text-accent-300'
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
        <div className="space-y-1">
          <p className="text-sm text-gray-500">
            {selectedSlugs.size > 0 ? (
              <>
                <span className="text-white font-medium">{selectedSlugs.size}</span> APIs selected
              </>
            ) : (
              'No APIs selected'
            )}
            {!isPro && (
              <span className={`ml-2 text-xs ${selectedSlugs.size > FREE_STACK_LIMIT ? 'text-red-400' : 'text-gray-600'}`}>
                ({selectedSlugs.size} / {FREE_STACK_LIMIT} free plan limit)
              </span>
            )}
          </p>
          {!isPro && selectedSlugs.size > FREE_STACK_LIMIT && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <Crown className="w-3 h-3" />
              Free plan is limited to {FREE_STACK_LIMIT} APIs.{' '}
              <Link href="/billing" className="underline hover:text-red-300">Upgrade to Pro</Link>
              {' '}for unlimited.
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || selectedSlugs.size === 0 || (!isPro && selectedSlugs.size > FREE_STACK_LIMIT)}
          className="bg-accent-600 hover:bg-accent-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save Stack'}
        </button>
      </div>
    </div>
  )
}
