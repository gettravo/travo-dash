import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE /api-routes/team/members?userId=xxx — remove a member
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const targetUserId = req.nextUrl.searchParams.get('userId')
  if (!targetUserId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const myMembership = await prisma.teamMember.findFirst({
    where: { userId: user.id, role: { in: ['owner', 'admin'] } },
  })
  if (!myMembership) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  // Can't remove the owner
  const target = await prisma.teamMember.findFirst({
    where: { teamId: myMembership.teamId, userId: targetUserId },
  })
  if (!target) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  if (target.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 })
  }

  await prisma.teamMember.delete({ where: { id: target.id } })
  return NextResponse.json({ ok: true })
}
