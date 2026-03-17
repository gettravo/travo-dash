'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function CreateTeamPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api-routes/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to create team')
        return
      }
      router.push('/team')
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/team" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to Team
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4">Create a team</h1>
        <p className="text-gray-500 mt-1">You'll be the team owner and can invite others.</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-4 max-w-sm">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Team name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Engineering"
            required
            className="w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          Create team
        </button>
      </form>
    </div>
  )
}
