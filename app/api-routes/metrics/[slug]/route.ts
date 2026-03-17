import { NextResponse } from 'next/server'
import { getMetricsForApi } from '@/lib/queries'
import { getUserFromRequest } from '@/lib/supabase/request-auth'
import { checkIsPro, FREE_METRICS_HOURS, PRO_METRICS_HOURS } from '@/lib/plan'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const requestedHours = Number(new URL(req.url).searchParams.get('hours') ?? FREE_METRICS_HOURS)
    const isPro = await checkIsPro(user.id)
    const maxHours = isPro ? PRO_METRICS_HOURS : FREE_METRICS_HOURS
    const hours = Math.min(requestedHours, maxHours)

    const data = await getMetricsForApi(slug, hours)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ...data, hoursServed: hours, isPro })
  } catch (err) {
    console.error('[metrics route]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
