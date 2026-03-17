import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api-routes/team/invite — send an invite
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id, role: { in: ['owner', 'admin'] } },
  })
  if (!membership) return NextResponse.json({ error: 'Not a team admin' }, { status: 403 })

  const { email } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const invite = await prisma.teamInvite.create({
    data: { teamId: membership.teamId, email: email.trim(), expiresAt },
    include: { team: true },
  })

  // Send invite email via Maileroo
  if (process.env.MAILEROO_SENDING_KEY) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://gettravo.com'}/team/join/${invite.token}`
    await fetch('https://smtp.maileroo.com/send', {
      method: 'POST',
      headers: {
        'X-Sending-Key': process.env.MAILEROO_SENDING_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'team@mail.gettravo.com',
        to: email.trim(),
        subject: `You're invited to join ${invite.team.name} on Travo`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #3b82f6">Team Invitation</h2>
            <p style="color: #374151">
              You've been invited to join <strong>${invite.team.name}</strong> on Travo,
              an API monitoring platform.
            </p>
            <a href="${inviteUrl}" style="
              display: inline-block;
              margin: 20px 0;
              padding: 12px 24px;
              background: #2563eb;
              color: #fff;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
            ">Accept Invitation</a>
            <p style="color: #6b7280; font-size: 13px;">
              This invitation expires in 7 days.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0" />
            <p style="color: #9ca3af; font-size: 12px">
              <a href="https://gettravo.com" style="color: #3b82f6">Travo</a> — API Health Monitoring
            </p>
          </div>
        `,
      }),
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true, inviteId: invite.id })
}

// GET /api-routes/team/invite?token=xxx — validate invite token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const invite = await prisma.teamInvite.findUnique({
    where: { token },
    include: { team: { include: { members: true } } },
  })

  if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
  }

  return NextResponse.json({
    teamName: invite.team.name,
    memberCount: invite.team.members.length,
    email: invite.email,
  })
}

// PUT /api-routes/team/invite — accept invite
export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const invite = await prisma.teamInvite.findUnique({ where: { token } })
  if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite expired' }, { status: 410 })
  }

  // Check if already in a team
  const existing = await prisma.teamMember.findFirst({ where: { userId: user.id } })
  if (existing) return NextResponse.json({ error: 'Already in a team' }, { status: 400 })

  await prisma.$transaction([
    prisma.teamMember.create({
      data: { teamId: invite.teamId, userId: user.id, role: 'member' },
    }),
    prisma.teamInvite.delete({ where: { id: invite.id } }),
  ])

  return NextResponse.json({ ok: true, teamId: invite.teamId })
}
