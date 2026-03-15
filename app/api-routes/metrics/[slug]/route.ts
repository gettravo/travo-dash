import { NextResponse } from 'next/server'
import { getMetricsForApi } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const data = await getMetricsForApi(slug)
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[metrics route]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
