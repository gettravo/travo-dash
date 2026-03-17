import { NextResponse } from 'next/server'
import { setUserPro } from '@/lib/plan'

export const dynamic = 'force-dynamic'

// Events that mean the user actively has Pro access
const PRO_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
  'TRANSFER',
])

// Events that mean access has definitively ended
const REVOKE_EVENTS = new Set(['EXPIRATION'])

// Cancellation does NOT revoke immediately — the user still has access until expiry,
// so we only set isPro=false on EXPIRATION.

export async function POST(req: Request) {
  // Verify webhook secret set in RevenueCat dashboard → Integrations → Webhooks
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: {
    event?: {
      type?: string
      app_user_id?: string
      original_app_user_id?: string
      entitlement_ids?: string[]
    }
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event = body.event
  if (!event) return NextResponse.json({ ok: true })

  const userId = event.app_user_id ?? event.original_app_user_id
  if (!userId) return NextResponse.json({ ok: true })

  const type = event.type ?? ''
  const entitlements = event.entitlement_ids ?? []
  const hasTravoPro = entitlements.includes('Travo Pro')

  if (PRO_EVENTS.has(type) && hasTravoPro) {
    await setUserPro(userId, true)
    console.log(`[billing/webhook] ${type} → isPro=true for ${userId}`)
  } else if (REVOKE_EVENTS.has(type)) {
    await setUserPro(userId, false)
    console.log(`[billing/webhook] ${type} → isPro=false for ${userId}`)
  }

  return NextResponse.json({ ok: true })
}
