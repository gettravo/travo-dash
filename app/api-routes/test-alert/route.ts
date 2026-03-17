import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const TEST_INCIDENT = {
  apiName: 'Test API',
  apiSlug: 'test',
  type: 'downtime',
  severity: 'critical',
  message: 'This is a test alert from Travo. Your notification channel is working correctly.',
  resolved: false,
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { channel } = await req.json()

  const settings = await prisma.alertSettings.findUnique({ where: { userId: user.id } })
  if (!settings) return NextResponse.json({ error: 'No alert settings found' }, { status: 404 })

  try {
    if (channel === 'hooktap') {
      if (!settings.hooktapEnabled || !settings.hooktapId) {
        return NextResponse.json({ error: 'HookTap not configured' }, { status: 400 })
      }
      const res = await fetch(`https://hooks.hooktap.me/webhook/${settings.hooktapId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'push',
          title: '🔴 Test Alert — Travo',
          body: TEST_INCIDENT.message,
        }),
      })
      if (!res.ok) throw new Error(`HookTap returned ${res.status}`)
    }

    if (channel === 'webhook') {
      if (!settings.webhookEnabled || !settings.webhookUrl) {
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
      }
      const res = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'incident',
          api: TEST_INCIDENT.apiSlug,
          severity: TEST_INCIDENT.severity,
          incidentType: TEST_INCIDENT.type,
          message: TEST_INCIDENT.message,
          resolved: false,
          startedAt: new Date().toISOString(),
          test: true,
        }),
      })
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`)
    }

    if (channel === 'email') {
      if (!settings.emailEnabled || !settings.email) {
        return NextResponse.json({ error: 'Email not configured' }, { status: 400 })
      }
      if (!process.env.MAILEROO_SENDING_KEY) {
        return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
      }
      const res = await fetch('https://smtp.maileroo.com/send', {
        method: 'POST',
        headers: {
          'X-Sending-Key': process.env.MAILEROO_SENDING_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'notifications@mail.gettravo.com',
          to: settings.email,
          subject: '🔴 Test Alert — Travo',
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
              <h2 style="color: #ef4444">Test Alert — Travo</h2>
              <p style="color: #374151">${TEST_INCIDENT.message}</p>
              <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
                Sent at ${new Date().toUTCString()}
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0" />
              <p style="color: #9ca3af; font-size: 12px">
                You're receiving this test because you clicked "Send test" in
                <a href="https://gettravo.com" style="color: #3b82f6">Travo</a>.
              </p>
            </div>
          `,
        }),
      })
      if (!res.ok) throw new Error(`Maileroo returned ${res.status}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
