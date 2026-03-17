'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Users } from 'lucide-react'

interface Props {
  token: string
  inviteData: {
    teamName?: string
    memberCount?: number
    email?: string
    error?: string
  }
}

export default function JoinTeamClient({ token, inviteData }: Props) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (inviteData.error) {
    return (
      <div className="text-center">
        <p className="text-red-400 font-medium mb-2">Invalid or expired invite</p>
        <p className="text-sm text-gray-500">{inviteData.error}</p>
        <a href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 mt-4 block">
          Go to dashboard →
        </a>
      </div>
    )
  }

  async function handleJoin() {
    setJoining(true)
    setError(null)
    try {
      const res = await fetch('/api-routes/team/invite', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to join team')
        return
      }
      router.push('/team')
      router.refresh()
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{inviteData.teamName}</h1>
          <p className="text-sm text-gray-500">{inviteData.memberCount} member{inviteData.memberCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400">
        You've been invited to join <strong className="text-white">{inviteData.teamName}</strong> on Travo.
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleJoin}
          disabled={joining}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {joining && <Loader2 className="w-4 h-4 animate-spin" />}
          Join team
        </button>
        <a
          href="/dashboard"
          className="flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors px-4 py-2.5"
        >
          Decline
        </a>
      </div>
    </div>
  )
}
