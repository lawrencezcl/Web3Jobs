import { MetadataRoute } from 'next'
import { prisma } from '../lib/db'

export const revalidate = 3600 // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.richidea.top'
  
  try {
    // Get recent and important job posts for better crawling priority
    const [recentJobs, popularJobs] = await Promise.all([
      // Recent jobs (high priority)
      prisma.job.findMany({
        select: {
          id: true,
          createdAt: true,
          postedAt: true,
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1000
      }),
      // Popular/older jobs (lower priority)
      prisma.job.findMany({
        select: {
          id: true,
          createdAt: true,
          postedAt: true,
        },
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5000
      })
    ])

    const recentJobUrls = recentJobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.postedAt || job.createdAt,
      changeFrequency: 'daily' as const,
      priority: 0.9, // High priority for recent jobs
    }))

    const popularJobUrls = popularJobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.postedAt || job.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7, // Lower priority for older jobs
    }))

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/jobs`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      // Add category pages for better SEO
      {
        url: `${baseUrl}/remote-jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/web3-developer-jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blockchain-engineer-jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/defi-jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      ...recentJobUrls,
      ...popularJobUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if database query fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      }
    ]
  }
}