import { NextResponse } from 'next/server'
import { detectStackFromGitHub, parseGitHubUrl } from '@/lib/stack-detector'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    if (!parseGitHubUrl(url)) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
    }

    const result = await detectStackFromGitHub(url)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[detect-stack]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
