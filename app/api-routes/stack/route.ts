import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase/request-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stack = await prisma.userStack.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ apiSlugs: stack?.apiSlugs ?? [], name: stack?.name ?? null })
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { apiSlugs, name } = await req.json()

    if (!Array.isArray(apiSlugs)) {
      return NextResponse.json({ error: 'apiSlugs must be an array' }, { status: 400 })
    }

    const stack = await prisma.userStack.upsert({
      where: { userId: user.id },
      update: { apiSlugs, name: name ?? null },
      create: { userId: user.id, apiSlugs, name: name ?? null },
    })

    return NextResponse.json({ apiSlugs: stack.apiSlugs, name: stack.name })
  } catch (err) {
    console.error('[stack POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
