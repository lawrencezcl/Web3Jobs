import { fetchLever } from '../../../../lib/connectors/lever'
import { fetchGreenhouse } from '../../../../lib/connectors/greenhouse'
import { prisma } from '../../../../lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Clear recent jobs to test insertion
    const recentJobs = await prisma.job.deleteMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    console.log(`Deleted ${recentJobs.count} recent jobs`)

    // Test all sources
    const results = []

    // Test Lever
    const leverJobs = await fetchLever('ledger')
    results.push({
      source: 'lever',
      company: 'ledger',
      totalJobs: leverJobs.length,
      remoteJobs: leverJobs.filter(job => job.remote).length,
      firstJob: leverJobs[0] || null
    })

    // Test Greenhouse
    const greenhouseJobs = await fetchGreenhouse('ripple')
    results.push({
      source: 'greenhouse',
      company: 'ripple',
      totalJobs: greenhouseJobs.length,
      remoteJobs: greenhouseJobs.filter(job => job.remote).length,
      firstJob: greenhouseJobs[0] || null
    })

    // Check database count
    const dbCount = await prisma.job.count()

    return Response.json({
      success: true,
      deletedRecentJobs: recentJobs.count,
      results,
      databaseCount: dbCount
    })
  } catch (error) {
    console.error('Debug ingest error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}