import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectStackFromGitHub, listGitHubRepos, parseGitHubUrl } from '@/lib/stack-detector'

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

    // Use provider_token for private repo access if available
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.provider_token ?? null

    const result = await detectStackFromGitHub(url, token)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[detect-stack]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// List the user's GitHub repos (requires GitHub OAuth with repo scope)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.provider_token

    if (!token) {
      return NextResponse.json({ repos: [], hasToken: false })
    }

    const repos = await listGitHubRepos(token)
    return NextResponse.json({ repos, hasToken: true })
  } catch (err) {
    console.error('[detect-stack GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
