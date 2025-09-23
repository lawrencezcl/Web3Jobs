import { ingestAll } from '@/lib/ingest'
import { prisma } from '@/lib/db'
import { notifySubscribers } from '@/lib/notify'

export const runtime = 'nodejs'

export async function GET() {
  const before = new Date()
  const { inserted } = await ingestAll()
  const created = await prisma.job.findMany({
    where: { createdAt: { gte: before } },
    select: { id: true }
  })
  await notifySubscribers(created.map(x=>x.id))
  return Response.json({ ok: true, inserted })
}
