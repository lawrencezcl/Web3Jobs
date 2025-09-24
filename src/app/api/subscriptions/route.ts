import { prisma } from '../../../lib/db'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}))
  const { type, identifier, topics } = body || {}
  if (!type || !identifier) return new Response('Bad Request', { status: 400 })
  await prisma.subscriber.upsert({
    where: { id: `${type}:${identifier}` },
    update: { topics: topics || null },
    create: { id: `${type}:${identifier}`, type, identifier, topics: topics || null }
  })
  return Response.json({ ok: true })
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(()=>({}))
  const { type, identifier } = body || {}
  if (!type || !identifier) return new Response('Bad Request', { status: 400 })
  await prisma.subscriber.delete({ where: { id: `${type}:${identifier}` } }).catch(()=>null)
  return Response.json({ ok: true })
}
