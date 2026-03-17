import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import TeamPageClient from './TeamPageClient'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          members: true,
          invites: { where: { expiresAt: { gt: new Date() } } },
        },
      },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-gray-500 mt-1">
          Collaborate with your team — share stacks and alerts.
        </p>
      </div>

      {membership ? (
        <TeamPageClient
          team={{
            id: membership.team.id,
            name: membership.team.name,
            createdAt: membership.team.createdAt.toISOString(),
          }}
          members={membership.team.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt.toISOString(),
          }))}
          pendingInvites={membership.team.invites.map((i) => ({
            id: i.id,
            email: i.email,
            expiresAt: i.expiresAt.toISOString(),
          }))}
          currentUserId={user.id}
          currentUserRole={membership.role}
        />
      ) : (
        <CreateTeamSection />
      )}
    </div>
  )
}

function CreateTeamSection() {
  return (
    <div className="max-w-lg">
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Create a team</h2>
          <p className="text-sm text-gray-500 mt-1">
            Invite teammates to collaborate — share stack visibility, alerts, and get 14-day history.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '👥', label: 'Shared stack', desc: 'See each other\'s monitored APIs' },
            { icon: '🔔', label: 'Team alerts', desc: 'Everyone gets notified together' },
            { icon: '📊', label: '14-day history', desc: 'Extended incident & metric history' },
          ].map((f) => (
            <div key={f.label} className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-lg mb-1">{f.icon}</p>
              <p className="text-sm font-medium text-white">{f.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/team/create"
          className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Create team →
        </Link>
      </div>
    </div>
  )
}
