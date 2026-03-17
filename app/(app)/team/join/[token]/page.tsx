import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JoinTeamClient from './JoinTeamClient'

interface Props { params: Promise<{ token: string }> }

export const dynamic = 'force-dynamic'

export default async function JoinTeamPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=/team/join/${token}`)
  }

  // Validate token server-side
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  let inviteData: { teamName?: string; memberCount?: number; email?: string; error?: string } = {}
  try {
    const res = await fetch(`${origin}/api-routes/team/invite?token=${token}`)
    inviteData = await res.json()
  } catch {
    inviteData = { error: 'Failed to load invite' }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <JoinTeamClient token={token} inviteData={inviteData} />
      </div>
    </div>
  )
}
