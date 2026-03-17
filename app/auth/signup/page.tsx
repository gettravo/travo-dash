'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Shield, Zap, Github as GithubIcon2, Bell, Activity } from 'lucide-react'

const FEATURES = [
  {
    icon: Activity,
    title: 'Monitor 26+ APIs in real-time',
    description: 'OpenAI, Stripe, GitHub, Vercel, Supabase and more — all in one dashboard.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Bell,
    title: 'Instant push notifications',
    description: 'Get alerted via iPhone push, email or webhook the moment something breaks.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    icon: GithubIcon2,
    title: 'GitHub stack auto-detect',
    description: 'Paste your repo URL — Travo scans your dependencies and builds your stack.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: Shield,
    title: '90-day uptime history',
    description: 'Detailed charts, error rates, latency trends, and full incident timeline.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubScope, setGithubScope] = useState<'public' | 'private' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleGitHub(scope: 'public' | 'private') {
    setGithubScope(scope)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: scope === 'private' ? 'read:user repo' : 'read:user',
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left — form */}
      <div className="w-full md:w-[480px] flex-shrink-0 flex flex-col justify-center px-8 py-12">
        <div className="max-w-sm w-full mx-auto">
          {done ? (
            <div className="text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-sm text-gray-400 mb-6">
                We sent a confirmation link to <strong className="text-white">{email}</strong>.
                Click it to activate your account.
              </p>
              <Link href="/auth/login" className="text-sm text-blue-400 hover:text-blue-300">
                Back to sign in →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Create account</h1>
                <p className="text-sm text-gray-500 mt-1">Start monitoring your API stack</p>
              </div>

              {/* OAuth buttons */}
              <div className="space-y-2.5 mb-5">
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-900 font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  <GoogleIcon />
                  {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                </button>

                <GitHubButton onSelect={handleGitHub} loading={githubScope !== null} />
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-600">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Min. 6 characters"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="text-sm text-gray-500 mt-5 text-center">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right — feature panel */}
      <div className="hidden md:flex flex-1 flex-col justify-center relative overflow-hidden bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(59,130,246,0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,_rgba(139,92,246,0.08),_transparent_60%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 px-12 py-16">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
              <span className="text-xs text-blue-400 font-medium">Live monitoring</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Know when your APIs
              <br />
              <span className="text-blue-400">go down</span> before your users do.
            </h2>
          </div>

          <div className="space-y-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`animate-fade-in-up flex items-start gap-4 p-4 rounded-xl border ${feature.bg}`}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/8">
            {[
              { value: '27+', label: 'APIs monitored' },
              { value: '1 min', label: 'Check interval' },
              { value: '90 days', label: 'Uptime history' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GitHubButton({
  onSelect,
  loading,
}: {
  onSelect: (scope: 'public' | 'private') => void
  loading: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <p className="px-4 py-2.5 text-xs text-gray-500 bg-gray-900/50 border-b border-white/10">
          Which repos should Travo access?
        </p>
        <button
          onClick={() => onSelect('public')}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <GitHubIcon />
          Public repos only
        </button>
        <button
          onClick={() => onSelect('private')}
          disabled={loading}
          className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border-t border-white/10 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <GitHubIcon />
          Public + private repos
          <span className="ml-auto text-xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
            Recommended
          </span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm border border-white/10"
    >
      <GitHubIcon />
      {loading ? 'Redirecting…' : 'Continue with GitHub'}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}
