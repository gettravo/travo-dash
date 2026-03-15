import { NextResponse } from 'next/server'
import { getAllApisWithStatus } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apis = await getAllApisWithStatus()
    return NextResponse.json(apis)
  } catch (err) {
    console.error('[status route]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
