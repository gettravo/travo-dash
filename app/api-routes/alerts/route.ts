import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase/request-auth'
import { prisma } from '@/lib/prisma'
import { checkIsPro } from '@/lib/plan'

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await prisma.alertSettings.findUnique({ where: { userId: user.id } })
  return NextResponse.json(settings ?? {})
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)

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

  const isPro = await checkIsPro(user.id)
  // Free users can only use email alerts — force advanced channels off
  const effectiveWebhookEnabled = isPro ? (webhookEnabled ?? false) : false
  const effectiveWebhookUrl = isPro ? (webhookUrl ?? null) : null
  const effectiveHooktapEnabled = isPro ? (hooktapEnabled ?? false) : false
  const effectiveHooktapId = isPro ? (hooktapId ?? null) : null

  const settings = await prisma.alertSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      emailEnabled: emailEnabled ?? false,
      email: email ?? null,
      webhookEnabled: effectiveWebhookEnabled,
      webhookUrl: effectiveWebhookUrl,
      hooktapEnabled: effectiveHooktapEnabled,
      hooktapId: effectiveHooktapId,
      notifyDowntime: notifyDowntime ?? true,
      notifyLatency: notifyLatency ?? true,
      notifyErrorRate: notifyErrorRate ?? true,
      notifyResolved: notifyResolved ?? true,
    },
    update: {
      emailEnabled: emailEnabled ?? false,
      email: email ?? null,
      webhookEnabled: effectiveWebhookEnabled,
      webhookUrl: effectiveWebhookUrl,
      hooktapEnabled: effectiveHooktapEnabled,
      hooktapId: effectiveHooktapId,
      notifyDowntime: notifyDowntime ?? true,
      notifyLatency: notifyLatency ?? true,
      notifyErrorRate: notifyErrorRate ?? true,
      notifyResolved: notifyResolved ?? true,
    },
  })

  return NextResponse.json(settings)
}
