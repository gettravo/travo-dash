import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { checkIsPro } from '@/lib/plan'

export const dynamic = 'force-dynamic'

// GET /api-routes/team — get the user's current team
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  if (!membership) return NextResponse.json({ team: null })

  return NextResponse.json({ team: membership.team, role: membership.role })
}

// POST /api-routes/team — create a team
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isPro = await checkIsPro(user.id)
  if (!isPro) {
    return NextResponse.json(
      { error: 'Teams are a Pro feature. Upgrade to create or join teams.', code: 'LIMIT_TEAMS' },
      { status: 403 }
    )
  }

  // Check if already in a team
  const existing = await prisma.teamMember.findFirst({ where: { userId: user.id } })
  if (existing) return NextResponse.json({ error: 'Already in a team' }, { status: 400 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Team name required' }, { status: 400 })

  const team = await prisma.team.create({
    data: {
      name: name.trim(),
      members: {
        create: { userId: user.id, role: 'owner' },
      },
    },
    include: { members: true },
  })

  return NextResponse.json({ team })
}

// DELETE /api-routes/team — leave or delete team
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id },
    include: { team: { include: { members: true } } },
  })
  if (!membership) return NextResponse.json({ error: 'Not in a team' }, { status: 400 })

  if (membership.role === 'owner' && membership.team.members.length > 1) {
    return NextResponse.json(
      { error: 'Transfer ownership before leaving' },
      { status: 400 }
    )
  }

  if (membership.role === 'owner' && membership.team.members.length === 1) {
    // Delete entire team
    await prisma.teamInvite.deleteMany({ where: { teamId: membership.teamId } })
    await prisma.teamMember.deleteMany({ where: { teamId: membership.teamId } })
    await prisma.userStack.updateMany({
      where: { teamId: membership.teamId },
      data: { teamId: null },
    })
    await prisma.team.delete({ where: { id: membership.teamId } })
  } else {
    await prisma.teamMember.delete({ where: { id: membership.id } })
  }

  return NextResponse.json({ ok: true })
}
