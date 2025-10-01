import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SearchFilters {
  q?: string
  location?: string
  remote?: string
  salary_min?: string
  salary_max?: string
  company_type?: string
  experience_level?: string
  tags?: string
  category?: string
  country?: string
  timezone?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: SearchFilters = {
      q: searchParams.get('q') || '',
      location: searchParams.get('location') || '',
      remote: searchParams.get('remote') || '',
      salary_min: searchParams.get('salary_min') || '',
      salary_max: searchParams.get('salary_max') || '',
      company_type: searchParams.get('company_type') || '',
      experience_level: searchParams.get('experience_level') || '',
      tags: searchParams.get('tags') || '',
      category: searchParams.get('category') || '',
      country: searchParams.get('country') || '',
      timezone: searchParams.get('timezone') || ''
    }
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const offset = (page - 1) * limit
    const sortBy = searchParams.get('sort') || 'date' // date, relevance, salary
    const featured = searchParams.get('featured') === 'true'

    // Build where clause
    const whereClause: any = {
      AND: []
    }

    // Text search
    if (filters.q) {
      whereClause.AND.push({
        OR: [
          { title: { contains: filters.q, mode: 'insensitive' } },
          { company: { contains: filters.q, mode: 'insensitive' } },
          { description: { contains: filters.q, mode: 'insensitive' } },
          { tags: { contains: filters.q, mode: 'insensitive' } }
        ]
      })
    }

    // Location filter
    if (filters.location && filters.location !== 'remote') {
      whereClause.AND.push({
        OR: [
          { location: { contains: filters.location, mode: 'insensitive' } },
          { country: { contains: filters.location, mode: 'insensitive' } }
        ]
      })
    }

    // Remote filter
    if (filters.remote === 'true') {
      whereClause.AND.push({ remote: true })
    } else if (filters.remote === 'false') {
      whereClause.AND.push({ remote: false })
    }

    // Tags/Skills filter
    if (filters.tags) {
      const tagList = filters.tags.split(',').map(tag => tag.trim())
      whereClause.AND.push({
        OR: tagList.map(tag => ({
          tags: { contains: tag, mode: 'insensitive' }
        }))
      })
    }

    // Company type filter (based on common Web3 categories)
    if (filters.company_type) {
      const typeKeywords = {
        'defi': ['defi', 'decentralized finance', 'uniswap', 'aave', 'compound', 'makerdao'],
        'nft': ['nft', 'opensea', 'rarible', 'superrare', 'foundation'],
        'dao': ['dao', 'governance', 'voting', 'treasury'],
        'layer1': ['ethereum', 'bitcoin', 'solana', 'avalanche', 'polygon'],
        'layer2': ['optimism', 'arbitrum', 'polygon', 'starknet'],
        'infrastructure': ['chainlink', 'the graph', 'filecoin', 'ipfs'],
        'exchange': ['coinbase', 'binance', 'kraken', 'ftx', 'crypto.com']
      }
      
      const keywords = typeKeywords[filters.company_type as keyof typeof typeKeywords] || []
      if (keywords.length > 0) {
        whereClause.AND.push({
          OR: [
            ...keywords.map(keyword => ({
              company: { contains: keyword, mode: 'insensitive' }
            })),
            ...keywords.map(keyword => ({
              title: { contains: keyword, mode: 'insensitive' }
            })),
            ...keywords.map(keyword => ({
              description: { contains: keyword, mode: 'insensitive' }
            }))
          ]
        })
      }
    }

    // Experience level filter
    if (filters.experience_level) {
      const levelKeywords = {
        'entry': ['entry', 'junior', 'graduate', 'intern', 'associate'],
        'mid': ['mid', 'intermediate', 'experienced', 'engineer'],
        'senior': ['senior', 'lead', 'principal', 'architect', 'staff'],
        'executive': ['director', 'vp', 'head', 'chief', 'founder']
      }
      
      const keywords = levelKeywords[filters.experience_level as keyof typeof levelKeywords] || []
      if (keywords.length > 0) {
        whereClause.AND.push({
          OR: keywords.map(keyword => ({
            title: { contains: keyword, mode: 'insensitive' }
          }))
        })
      }
    }

    // Featured filter
    if (featured) {
      whereClause.AND.push({
        OR: [
          { tags: { contains: 'featured', mode: 'insensitive' } },
          { tags: { contains: 'preferred', mode: 'insensitive' } },
          { company: { in: ['Coinbase', 'Uniswap', 'Aave', 'Chainlink', 'Polygon', 'OpenSea'] } }
        ]
      })
    }

    // Date range filter
    const dateRange = searchParams.get('dateRange')
    if (dateRange) {
      const now = new Date()
      let startDate: Date
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }
      
      whereClause.AND.push({
        OR: [
          { postedAt: { gte: startDate } },
          { createdAt: { gte: startDate } }
        ]
      })
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'relevance':
        // For relevance, we'll use a combination of factors
        orderBy = [
          { postedAt: 'desc' },
          { createdAt: 'desc' }
        ]
        break
      case 'salary':
        orderBy = [
          { salary: 'desc' },
          { createdAt: 'desc' }
        ]
        break
      case 'company':
        orderBy = [
          { company: 'asc' },
          { createdAt: 'desc' }
        ]
        break
      default: // date
        orderBy = [
          { postedAt: 'desc' },
          { createdAt: 'desc' }
        ]
    }

    // Execute queries
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: whereClause.AND.length > 0 ? whereClause : {},
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          country: true,
          remote: true,
          tags: true,
          url: true,
          source: true,
          postedAt: true,
          createdAt: true,
          salary: true,
          currency: true,
          employmentType: true,
          seniorityLevel: true,
          description: true
        }
      }),
      prisma.job.count({
        where: whereClause.AND.length > 0 ? whereClause : {}
      })
    ])

    // Add relevance scoring for text search
    const processedJobs = jobs.map(job => {
      let relevanceScore = 0
      
      if (filters.q) {
        const query = filters.q.toLowerCase()
        const title = job.title.toLowerCase()
        const company = job.company.toLowerCase()
        const description = (job.description || '').toLowerCase()
        
        // Title exact match gets highest score
        if (title.includes(query)) relevanceScore += 10
        // Company match gets high score
        if (company.includes(query)) relevanceScore += 8
        // Description match gets lower score
        if (description.includes(query)) relevanceScore += 3
        
        // Bonus for Web3-specific terms
        const web3Terms = ['web3', 'blockchain', 'defi', 'smart contract', 'ethereum', 'solidity', 'nft', 'dao']
        web3Terms.forEach(term => {
          if (title.includes(term) || company.includes(term)) {
            relevanceScore += 2
          }
        })
      }
      
      return {
        ...job,
        relevanceScore
      }
    })

    // Sort by relevance if requested and there's a search query
    const finalJobs = sortBy === 'relevance' && filters.q 
      ? processedJobs.sort((a, b) => b.relevanceScore - a.relevanceScore)
      : processedJobs

    return Response.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: finalJobs.map(({ relevanceScore, ...job }) => job), // Remove relevanceScore from response
      filters: {
        applied: Object.entries(filters).filter(([_, value]) => value).length,
        available: {
          locations: await getPopularLocations(),
          companies: await getPopularCompanies(),
          skills: await getPopularSkills(),
          categories: [
            'defi', 'nft', 'dao', 'layer1', 'layer2', 'infrastructure', 'exchange'
          ],
          experienceLevels: ['entry', 'mid', 'senior', 'executive']
        }
      },
      meta: {
        searchTerm: filters.q,
        timestamp: new Date().toISOString(),
        geo: await getGeoData(request)
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper functions
async function getPopularLocations() {
  try {
    const locations = await prisma.job.groupBy({
      by: ['location'],
      _count: { location: true },
      where: {
        location: { not: null },
        remote: false
      },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    })
    return locations.map(l => ({ name: l.location, count: l._count.location }))
  } catch {
    return []
  }
}

async function getPopularCompanies() {
  try {
    const companies = await prisma.job.groupBy({
      by: ['company'],
      _count: { company: true },
      orderBy: { _count: { company: 'desc' } },
      take: 20
    })
    return companies.map(c => ({ name: c.company, count: c._count.company }))
  } catch {
    return []
  }
}

async function getPopularSkills() {
  try {
    // This is a simplified version - in production you'd want to parse tags properly
    const jobs = await prisma.job.findMany({
      where: { tags: { not: null } },
      select: { tags: true },
      take: 1000
    })
    
    const skillCounts: { [key: string]: number } = {}
    jobs.forEach(job => {
      if (job.tags) {
        job.tags.split(',').forEach(tag => {
          const skill = tag.trim().toLowerCase()
          skillCounts[skill] = (skillCounts[skill] || 0) + 1
        })
      }
    })
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }))
  } catch {
    return []
  }
}

async function getGeoData(request: NextRequest) {
  const country = request.geo?.country || 'Unknown'
  const city = request.geo?.city || 'Unknown'
  const region = request.geo?.region || 'Unknown'
  
  return {
    country,
    city,
    region,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}