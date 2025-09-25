import { ingestAll } from '../../../lib/ingest'
import { prisma } from '../../../lib/db'
import { notifySubscribers } from '../../../lib/notify'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  if (!process.env.CRAWL_TOKEN || token !== process.env.CRAWL_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
  const before = new Date()
  const { inserted, sources } = await ingestAll()
  const created = await prisma.job.findMany({ where: { createdAt: { gte: before } }, select: { id: true } })
  await notifySubscribers(created.map(x=>x.id))
  return Response.json({ ok: true, inserted, sources })
}
