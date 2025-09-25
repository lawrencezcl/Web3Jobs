import { prisma } from '../../../lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get unique countries
    const countries = await prisma.job.findMany({
      where: { country: { not: null } },
      select: { country: true },
      distinct: ['country']
    })

    // Get unique seniority levels
    const seniorityLevels = await prisma.job.findMany({
      where: { seniorityLevel: { not: null } },
      select: { seniorityLevel: true },
      distinct: ['seniorityLevel']
    })

    // Get unique sources
    const sources = await prisma.job.findMany({
      select: { source: true },
      distinct: ['source']
    })

    // Get salary range info
    const salaryStats = await prisma.job.aggregate({
      _min: { salaryMin: true },
      _max: { salaryMax: true },
      where: {
        OR: [
          { salaryMin: { not: null } },
          { salaryMax: { not: null } }
        ]
      }
    })

    return Response.json({
      countries: countries.map(c => c.country).filter(Boolean).sort(),
      seniorityLevels: seniorityLevels.map(s => s.seniorityLevel).filter(Boolean).sort(),
      sources: sources.map(s => s.source).sort(),
      salaryRange: {
        min: salaryStats._min.salaryMin || 0,
        max: salaryStats._max.salaryMax || 500000
      }
    })
  } catch (error) {
    console.error('Error fetching filters:', error)
    return Response.json({ 
      countries: [], 
      seniorityLevels: [], 
      sources: [],
      salaryRange: { min: 0, max: 500000 }
    })
  }
}