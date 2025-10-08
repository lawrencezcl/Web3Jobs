import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const enhancedSearchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  companies: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().optional(),
  experienceLevel: z.string().optional(),
  employmentType: z.string().optional(),
  datePosted: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  featured: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['relevance', 'date', 'salary', 'company']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)

    // Parse and validate parameters
    const validatedParams = enhancedSearchSchema.parse({
      query: params.q || params.query,
      tags: params.tags ? params.tags.split(',').filter(Boolean) : undefined,
      companies: params.companies ? params.companies.split(',').filter(Boolean) : undefined,
      locations: params.locations ? params.locations.split(',').filter(Boolean) : undefined,
      remote: params.remote ? params.remote === 'true' : undefined,
      salaryMin: params.salaryMin ? parseInt(params.salaryMin) : undefined,
      salaryMax: params.salaryMax ? parseInt(params.salaryMax) : undefined,
      currency: params.currency || 'USD',
      experienceLevel: params.experienceLevel,
      employmentType: params.employmentType,
      datePosted: params.datePosted,
      companySize: params.companySize,
      industry: params.industry,
      featured: params.featured ? params.featured === 'true' : undefined,
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 20,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    })

    // Build where clause
    const where: any = {}

    // Text search
    if (validatedParams.query) {
      where.OR = [
        { title: { contains: validatedParams.query, mode: 'insensitive' } },
        { company: { contains: validatedParams.query, mode: 'insensitive' } },
        { description: { contains: validatedParams.query, mode: 'insensitive' } },
        { tags: { contains: validatedParams.query, mode: 'insensitive' } },
      ]
    }

    // Tags filter
    if (validatedParams.tags && validatedParams.tags.length > 0) {
      where.AND = where.AND || []
      where.AND.push({
        OR: validatedParams.tags.map(tag => ({
          tags: { contains: tag, mode: 'insensitive' }
        }))
      })
    }

    // Companies filter
    if (validatedParams.companies && validatedParams.companies.length > 0) {
      where.AND = where.AND || []
      where.AND.push({
        OR: validatedParams.companies.map(company => ({
          company: { contains: company, mode: 'insensitive' }
        }))
      })
    }

    // Locations filter
    if (validatedParams.locations && validatedParams.locations.length > 0) {
      where.AND = where.AND || []
      where.AND.push({
        OR: validatedParams.locations.map(location => ({
          OR: [
            { location: { contains: location, mode: 'insensitive' } },
            { country: { contains: location, mode: 'insensitive' } },
          ]
        }))
      })
    }

    // Remote filter
    if (validatedParams.remote !== undefined) {
      where.remote = validatedParams.remote
    }

    // Salary filter
    if (validatedParams.salaryMin !== undefined || validatedParams.salaryMax !== undefined) {
      where.AND = where.AND || []
      const salaryCondition: any = {}

      if (validatedParams.salaryMin !== undefined) {
        salaryCondition.gte = validatedParams.salaryMin
      }
      if (validatedParams.salaryMax !== undefined) {
        salaryCondition.lte = validatedParams.salaryMax
      }

      where.AND.push({
        OR: [
          { salaryMin: salaryCondition },
          { salaryMax: salaryCondition },
          { salary: { contains: validatedParams.salaryMin?.toString() || '', mode: 'insensitive' } },
        ]
      })
    }

    // Experience level filter
    if (validatedParams.experienceLevel) {
      where.seniorityLevel = { contains: validatedParams.experienceLevel, mode: 'insensitive' }
    }

    // Employment type filter
    if (validatedParams.employmentType) {
      where.employmentType = { contains: validatedParams.employmentType, mode: 'insensitive' }
    }

    // Date posted filter
    if (validatedParams.datePosted) {
      const now = new Date()
      let dateFilter: Date

      switch (validatedParams.datePosted) {
        case 'today':
          dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          dateFilter = new Date(0) // Beginning of time
      }

      where.postedAt = { gte: dateFilter }
    }

    // Featured jobs filter
    if (validatedParams.featured) {
      // Note: In a real implementation, you'd have a featured field in the Job model
      // For now, we'll simulate by looking for certain keywords or sources
      where.OR = where.OR || [
        { source: { in: ['LinkedIn', 'AngelList', 'Wellfound'] } },
        { tags: { contains: 'senior', mode: 'insensitive' } },
        { salaryMin: { gte: 100000 } },
      ]
    }

    // Build order by clause
    let orderBy: any = {}

    switch (validatedParams.sortBy) {
      case 'date':
        orderBy = { postedAt: validatedParams.sortOrder }
        break
      case 'salary':
        orderBy = { salaryMin: validatedParams.sortOrder }
        break
      case 'company':
        orderBy = { company: validatedParams.sortOrder }
        break
      case 'relevance':
      default:
        // For relevance, we'll prioritize recent postings and match quality
        orderBy = [
          { postedAt: 'desc' },
          { createdAt: 'desc' },
          { source: 'asc' }
        ]
        break
    }

    // Execute queries in parallel
    const [jobs, total, suggestions] = await Promise.all([
      // Get jobs
      prisma.job.findMany({
        where,
        orderBy,
        skip: (validatedParams.page - 1) * validatedParams.limit,
        take: validatedParams.limit,
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
          salaryMin: true,
          salaryMax: true,
          currency: true,
          employmentType: true,
          seniorityLevel: true,
          description: true,
        },
      }),

      // Get total count
      prisma.job.count({ where }),

      // Get search suggestions (if there's a query)
      validatedParams.query ? getSearchSuggestions(validatedParams.query) : Promise.resolve([]),
    ])

    // Format jobs for response
    const formattedJobs = jobs.map(job => ({
      ...job,
      postedAt: job.postedAt?.toISOString(),
      createdAt: job.createdAt.toISOString(),
    }))

    // Calculate pagination info
    const pages = Math.ceil(total / validatedParams.limit)
    const hasNextPage = validatedParams.page < pages
    const hasPreviousPage = validatedParams.page > 1

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        pages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        applied: {
          query: validatedParams.query,
          tags: validatedParams.tags,
          companies: validatedParams.companies,
          locations: validatedParams.locations,
          remote: validatedParams.remote,
          salaryMin: validatedParams.salaryMin,
          salaryMax: validatedParams.salaryMax,
          experienceLevel: validatedParams.experienceLevel,
          employmentType: validatedParams.employmentType,
          datePosted: validatedParams.datePosted,
          companySize: validatedParams.companySize,
          industry: validatedParams.industry,
          featured: validatedParams.featured,
        },
        activeFiltersCount: Object.entries({
          query: validatedParams.query,
          tags: validatedParams.tags?.length,
          companies: validatedParams.companies?.length,
          locations: validatedParams.locations?.length,
          remote: validatedParams.remote,
          salaryMin: validatedParams.salaryMin,
          salaryMax: validatedParams.salaryMax,
          experienceLevel: validatedParams.experienceLevel,
          employmentType: validatedParams.employmentType,
          datePosted: validatedParams.datePosted,
          companySize: validatedParams.companySize,
          industry: validatedParams.industry,
          featured: validatedParams.featured,
        }).filter(([key, value]) => value !== undefined && value !== false && (Array.isArray(value) ? value.length > 0 : true)).length,
      },
      suggestions,
      meta: {
        queryTime: Date.now(),
        resultsCount: jobs.length,
        searchPerformed: !!validatedParams.query || Object.keys(validatedParams).some(key =>
          key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder' && validatedParams[key as keyof typeof validatedParams] !== undefined
        ),
      },
    })

  } catch (error) {
    console.error('Enhanced jobs search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get search suggestions
async function getSearchSuggestions(query: string) {
  try {
    const suggestions = await prisma.job.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        title: true,
        company: true,
        tags: true,
      },
      take: 10,
      distinct: ['title', 'company'],
    })

    // Extract unique suggestions
    const jobTitles = [...new Set(suggestions.map(s => s.title))].slice(0, 3)
    const companies = [...new Set(suggestions.map(s => s.company))].slice(0, 3)
    const tags = [...new Set(
      suggestions.flatMap(s => s.tags?.split(',').filter(Boolean) || [])
    )].slice(0, 4)

    return {
      jobTitles,
      companies,
      tags,
    }
  } catch (error) {
    console.error('Error getting suggestions:', error)
    return { jobTitles: [], companies: [], tags: [] }
  }
}