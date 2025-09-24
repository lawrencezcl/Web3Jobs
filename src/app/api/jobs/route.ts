import { prisma } from '../../../lib/db'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const tag = searchParams.get('tag') || ''
  const source = searchParams.get('source') || ''
  const remote = searchParams.get('remote') || 'true'
  const country = searchParams.get('country') || ''
  const seniority = searchParams.get('seniority') || ''
  const salaryMin = searchParams.get('salaryMin')
  const salaryMax = searchParams.get('salaryMax')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const skip = (page - 1) * limit

  const where:any = {}
  if (remote) where.remote = remote === 'true'
  if (source) where.source = source
  if (country) where.country = { contains: country, mode: 'insensitive' }
  if (seniority) where.seniorityLevel = { contains: seniority, mode: 'insensitive' }
  if (tag) where.tags = { contains: tag, mode: 'insensitive' }
  if (salaryMin || salaryMax) {
    where.AND = where.AND || []
    if (salaryMin) {
      where.AND.push({ 
        OR: [
          { salaryMin: { gte: parseInt(salaryMin) } },
          { salaryMax: { gte: parseInt(salaryMin) } }
        ]
      })
    }
    if (salaryMax) {
      where.AND.push({ 
        OR: [
          { salaryMin: { lte: parseInt(salaryMax) } },
          { salaryMax: { lte: parseInt(salaryMax) } }
        ]
      })
    }
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip
    }),
    prisma.job.count({ where })
  ])

  return Response.json({ total, page, limit, items })
}
