import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'
    
    switch (type) {
      case 'trending':
        return Response.json(await getTrendingData())
      case 'companies':
        return Response.json(await getCompanyStats())
      case 'skills':
        return Response.json(await getSkillsData())
      case 'locations':
        return Response.json(await getLocationStats())
      case 'overview':
      default:
        return Response.json(await getOverviewStats())
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return Response.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function getOverviewStats() {
  const [totalJobs, remoteJobs, companiesCount, recentJobs] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { remote: true } }),
    prisma.job.groupBy({
      by: ['company'],
      _count: { company: true }
    }).then(result => result.length),
    prisma.job.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })
  ])

  return {
    totalJobs,
    remoteJobs,
    remotePercentage: Math.round((remoteJobs / totalJobs) * 100),
    companiesCount,
    recentJobs,
    lastUpdated: new Date().toISOString()
  }
}

async function getTrendingData() {
  // Get trending keywords from recent job postings
  const recentJobs = await prisma.job.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      },
      tags: { not: null }
    },
    select: { tags: true, title: true, company: true }
  })

  // Count keyword frequencies
  const keywordCounts: { [key: string]: number } = {}
  const web3Keywords = [
    'solidity', 'ethereum', 'blockchain', 'defi', 'web3', 'smart contracts',
    'nft', 'dao', 'cryptocurrency', 'crypto', 'bitcoin', 'polygon', 'avalanche',
    'chainlink', 'uniswap', 'aave', 'compound', 'opensea', 'layer 2', 'rust',
    'typescript', 'javascript', 'react', 'node.js', 'python', 'go', 'java'
  ]

  recentJobs.forEach(job => {
    const text = `${job.title} ${job.tags || ''}`.toLowerCase()
    web3Keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
      }
    })
  })

  const trending = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count, trend: '+' }))

  return {
    trending,
    period: '30 days',
    totalAnalyzed: recentJobs.length
  }
}

async function getCompanyStats() {
  const companies = await prisma.job.groupBy({
    by: ['company'],
    _count: { company: true },
    orderBy: { _count: { company: 'desc' } },
    take: 20
  })

  // Get remote job percentage for each company
  const companiesWithStats = await Promise.all(
    companies.map(async (company) => {
      const [totalJobs, remoteJobs] = await Promise.all([
        prisma.job.count({ where: { company: company.company } }),
        prisma.job.count({ where: { company: company.company, remote: true } })
      ])
      
      return {
        name: company.company,
        totalJobs,
        remoteJobs,
        remotePercentage: Math.round((remoteJobs / totalJobs) * 100)
      }
    })
  )

  return {
    topCompanies: companiesWithStats,
    totalCompanies: companies.length
  }
}

async function getSkillsData() {
  const jobs = await prisma.job.findMany({
    where: { tags: { not: null } },
    select: { tags: true }
  })

  const skillCounts: { [key: string]: number } = {}
  jobs.forEach(job => {
    if (job.tags) {
      job.tags.split(',').forEach(tag => {
        const skill = tag.trim().toLowerCase()
        if (skill.length > 2) { // Filter out very short tags
          skillCounts[skill] = (skillCounts[skill] || 0) + 1
        }
      })
    }
  })

  const topSkills = Object.entries(skillCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 30)
    .map(([skill, count]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      count,
      percentage: Math.round((count / jobs.length) * 100)
    }))

  return {
    topSkills,
    totalSkillsAnalyzed: Object.keys(skillCounts).length
  }
}

async function getLocationStats() {
  const [locationStats, countryStats] = await Promise.all([
    prisma.job.groupBy({
      by: ['location'],
      _count: { location: true },
      where: {
        location: { not: null },
        remote: false
      },
      orderBy: { _count: { location: 'desc' } },
      take: 15
    }),
    prisma.job.groupBy({
      by: ['country'],
      _count: { country: true },
      where: {
        country: { not: null }
      },
      orderBy: { _count: { country: 'desc' } },
      take: 10
    })
  ])

  const remoteCount = await prisma.job.count({ where: { remote: true } })
  const totalJobs = await prisma.job.count()

  return {
    topLocations: locationStats.map(l => ({
      location: l.location,
      count: l._count.location
    })),
    topCountries: countryStats.map(c => ({
      country: c.country,
      count: c._count.country
    })),
    remoteJobs: {
      count: remoteCount,
      percentage: Math.round((remoteCount / totalJobs) * 100)
    }
  }
}