import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret')
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const api = await prisma.api.findUnique({ where: { slug } })
  if (!api) return NextResponse.json({ error: 'API not found' }, { status: 404 })

  const [metrics, incidents] = await Promise.all([
    prisma.metric.deleteMany({ where: { apiId: api.id } }),
    prisma.incident.deleteMany({ where: { apiId: api.id, resolvedAt: null } }),
  ])

  return NextResponse.json({
    ok: true,
    deletedMetrics: metrics.count,
    closedIncidents: incidents.count,
  })
}
