import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.alertSettings.findUnique({ where: { userId: user.id } })
  return NextResponse.json(settings ?? {})
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    emailEnabled,
    email,
    webhookEnabled,
    webhookUrl,
    hooktapEnabled,
    hooktapId,
    notifyDowntime,
    notifyLatency,
    notifyErrorRate,
    notifyResolved,
  } = body

  const settings = await prisma.alertSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      emailEnabled: emailEnabled ?? false,
      email: email ?? null,
      webhookEnabled: webhookEnabled ?? false,
      webhookUrl: webhookUrl ?? null,
      hooktapEnabled: hooktapEnabled ?? false,
      hooktapId: hooktapId ?? null,
      notifyDowntime: notifyDowntime ?? true,
      notifyLatency: notifyLatency ?? true,
      notifyErrorRate: notifyErrorRate ?? true,
      notifyResolved: notifyResolved ?? true,
    },
    update: {
      emailEnabled: emailEnabled ?? false,
      email: email ?? null,
      webhookEnabled: webhookEnabled ?? false,
      webhookUrl: webhookUrl ?? null,
      hooktapEnabled: hooktapEnabled ?? false,
      hooktapId: hooktapId ?? null,
      notifyDowntime: notifyDowntime ?? true,
      notifyLatency: notifyLatency ?? true,
      notifyErrorRate: notifyErrorRate ?? true,
      notifyResolved: notifyResolved ?? true,
    },
  })

  return NextResponse.json(settings)
}
