import { NextResponse } from 'next/server'
import { getIncidentsForApi } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const incidents = await getIncidentsForApi(slug)
    return NextResponse.json(incidents)
  } catch (err) {
    console.error('[incidents route]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
