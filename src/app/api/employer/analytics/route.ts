import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30days'
    const companyId = searchParams.get('companyId')

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // In a real implementation, you'd fetch jobs posted by this employer
    // For now, we'll simulate with all jobs and company-based filtering
    const where: any = {
      createdAt: { gte: startDate },
    }

    if (companyId) {
      where.company = { contains: companyId, mode: 'insensitive' }
    }

    // Get analytics data in parallel
    const [
      totalJobs,
      totalApplications,
      recentJobs,
      applicationTrends,
      topLocations,
      topSkills,
      companyStats,
    ] = await Promise.all([
      // Total jobs posted
      prisma.job.count({
        where: {
          ...where,
          // In real implementation: { employerId: decoded.userId }
        },
      }),

      // Total applications (simulated - would come from Application model)
      Math.floor(Math.random() * 500) + 100,

      // Recent jobs
      prisma.job.findMany({
        where: {
          ...where,
          // In real implementation: { employerId: decoded.userId }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          remote: true,
          createdAt: true,
          tags: true,
        },
      }),

      // Application trends (simulated data)
      generateApplicationTrends(startDate, now),

      // Top locations
      prisma.job.groupBy({
        by: ['location'],
        where: {
          ...where,
          location: { not: null },
          // In real implementation: { employerId: decoded.userId }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Top skills (from tags)
      getTopSkills(startDate),

      // Company statistics
      getCompanyStats(decoded.userId),
    ])

    // Calculate performance metrics
    const avgApplicationsPerJob = totalApplications > 0 && totalJobs > 0
      ? Math.round(totalApplications / totalJobs)
      : 0

    const growthRate = calculateGrowthRate(startDate, now, decoded.userId)

    const analytics = {
      overview: {
        totalJobs,
        totalApplications,
        avgApplicationsPerJob,
        activeJobs: totalJobs, // In real implementation, would filter for active jobs
        growthRate,
        timeRange,
      },
      recentJobs: recentJobs.map(job => ({
        ...job,
        applications: Math.floor(Math.random() * 50) + 1, // Simulated application count
        views: Math.floor(Math.random() * 200) + 50, // Simulated view count
        postedAt: job.createdAt.toISOString(),
      })),
      applicationTrends,
      topLocations: topLocations.map(item => ({
        location: item.location || 'Unknown',
        jobs: item._count.id,
      })),
      topSkills,
      companyStats,
      performance: {
        applicationRate: totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) / 100 : 0,
        responseRate: Math.floor(Math.random() * 30) + 40, // Simulated
        averageTimeToHire: Math.floor(Math.random() * 20) + 10, // Simulated (days)
        costPerHire: Math.floor(Math.random() * 5000) + 2000, // Simulated
      },
      insights: generateInsights(totalJobs, totalApplications, growthRate),
    }

    return NextResponse.json({
      success: true,
      analytics,
      meta: {
        generatedAt: new Date().toISOString(),
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString(),
        },
      },
    })

  } catch (error) {
    console.error('Employer analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions for generating analytics data
function generateApplicationTrends(startDate: Date, endDate: Date) {
  const trends = []
  const current = new Date(startDate)

  while (current <= endDate) {
    trends.push({
      date: current.toISOString().split('T')[0],
      applications: Math.floor(Math.random() * 20) + 5,
      views: Math.floor(Math.random() * 100) + 20,
      jobs: Math.floor(Math.random() * 5) + 1,
    })
    current.setDate(current.getDate() + 1)
  }

  return trends
}

async function getTopSkills(startDate: Date) {
  // This would typically analyze tags from jobs posted by the employer
  const skills = [
    { skill: 'Solidity', count: 45 },
    { skill: 'React', count: 38 },
    { skill: 'TypeScript', count: 35 },
    { skill: 'Node.js', count: 28 },
    { skill: 'Web3', count: 25 },
    { skill: 'DeFi', count: 22 },
    { skill: 'Smart Contracts', count: 20 },
    { skill: 'Rust', count: 18 },
    { skill: 'NFT', count: 15 },
    { skill: 'Blockchain', count: 12 },
  ]

  return skills
}

async function getCompanyStats(userId: string) {
  // In real implementation, this would fetch actual company data
  return {
    totalCompanies: 3,
    verifiedCompanies: 2,
    featuredJobs: 8,
    totalSpent: Math.floor(Math.random() * 10000) + 5000,
    averageCostPerJob: Math.floor(Math.random() * 500) + 200,
  }
}

function calculateGrowthRate(startDate: Date, endDate: Date, userId: string): number {
  // In real implementation, this would compare with previous period
  return Math.floor(Math.random() * 50) + 10 // Simulated growth rate
}

function generateInsights(totalJobs: number, totalApplications: number, growthRate: number) {
  const insights = []

  if (growthRate > 20) {
    insights.push({
      type: 'positive',
      title: 'Strong Growth',
      description: `Your job postings are seeing ${growthRate}% growth compared to last period.`,
    })
  }

  if (totalApplications > totalJobs * 10) {
    insights.push({
      type: 'positive',
      title: 'High Engagement',
      description: 'Your job listings are receiving above-average applications.',
    })
  }

  if (totalJobs < 5) {
    insights.push({
      type: 'suggestion',
      title: 'Post More Jobs',
      description: 'Consider posting more jobs to increase your reach and visibility.',
    })
  }

  insights.push({
    type: 'tip',
    title: 'Optimize Your Listings',
    description: 'Jobs with detailed descriptions and salary ranges receive 3x more applications.',
  })

  return insights
}