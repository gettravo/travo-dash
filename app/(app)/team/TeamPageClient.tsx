'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserX, Mail, Copy, CheckCircle, Crown, Users } from 'lucide-react'

interface Team { id: string; name: string; createdAt: string }
interface Member { id: string; userId: string; role: string; joinedAt: string }
interface Invite { id: string; email: string; expiresAt: string }

interface Props {
  team: Team
  members: Member[]
  pendingInvites: Invite[]
  currentUserId: string
  currentUserRole: string
}

export default function TeamPageClient({ team, members, pendingInvites, currentUserId, currentUserRole }: Props) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSent, setInviteSent] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin'

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteError(null)
    try {
      const res = await fetch('/api-routes/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setInviteError(data.error ?? 'Failed to send invite')
        return
      }
      setInviteSent(true)
      setInviteEmail('')
      setTimeout(() => setInviteSent(false), 3000)
      router.refresh()
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId)
    try {
      await fetch(`/api-routes/team/members?userId=${userId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setRemovingId(null)
    }
  }

  async function handleLeave() {
    setLeaving(true)
    try {
      await fetch('/api-routes/team', { method: 'DELETE' })
      router.refresh()
    } finally {
      setLeaving(false)
    }
  }

  function copyTeamId() {
    navigator.clipboard.writeText(team.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Team header */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{team.name}</h2>
              <p className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyTeamId}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy ID'}
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Members</h3>
        </div>
        <div className="divide-y divide-white/5">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-xs text-gray-400 font-mono">
                  {member.userId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white font-mono text-xs">{member.userId}</p>
                  <p className="text-xs text-gray-600">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.role === 'owner' && (
                  <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                    <Crown className="w-3 h-3" />
                    Owner
                  </div>
                )}
                {member.role !== 'owner' && (
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                    {member.role}
                  </span>
                )}
                {isAdmin && member.userId !== currentUserId && member.role !== 'owner' && (
                  <button
                    type="button"
                    onClick={() => handleRemove(member.userId)}
                    disabled={removingId === member.userId}
                    className="p-1.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Remove member"
                  >
                    {removingId === member.userId ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserX className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      {isAdmin && (
        <div className="bg-gray-900 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Invite member</h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {inviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : inviteSent ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {inviteSent ? 'Sent!' : 'Invite'}
            </button>
          </form>
          {inviteError && <p className="text-sm text-red-400">{inviteError}</p>}

          {pendingInvites.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Pending invites</p>
              <div className="space-y-1.5">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-300">{inv.email}</span>
                    <span className="text-xs text-gray-600">
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave team */}
      <div className="pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLeave}
          disabled={leaving}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {currentUserRole === 'owner' && members.length === 1
            ? 'Delete team'
            : currentUserRole === 'owner'
            ? 'Transfer ownership first to leave'
            : 'Leave team'}
        </button>
      </div>
    </div>
  )
}
