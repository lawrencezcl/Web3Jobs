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
        url: `${baseUrl}/jobs?remote=true`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/jobs?q=solidity+developer`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=smart+contract`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=defi`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=nft`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=blockchain+engineer`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=web3+frontend`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=layer+2`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/jobs?q=rust`,
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