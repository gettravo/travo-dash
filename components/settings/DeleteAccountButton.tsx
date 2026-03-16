'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Trash2 } from 'lucide-react'

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const res = await fetch('/api-routes/account/delete', { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Failed to delete account.')
      setLoading(false)
      return
    }

    // Sign out and redirect
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete account
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-300">
        This will permanently delete your account, stack, and all alert settings.{' '}
        <strong className="text-white">This cannot be undone.</strong>
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {loading ? 'Deleting…' : 'Yes, delete my account'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
