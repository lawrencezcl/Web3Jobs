import { ingestAll } from '../../../lib/ingest'
import { prisma } from '../../../lib/db'
import { notifySubscribers } from '../../../lib/notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max execution time

export async function GET() {
  try {
    const before = new Date()
    console.log('Starting cron job ingestion...')

    // Set a timeout for the entire ingestion process
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Cron job timeout after 4 minutes')), 240000)
    })

    const ingestionPromise = ingestAll()

    // Race between ingestion and timeout
    const { inserted, sources } = await Promise.race([ingestionPromise, timeoutPromise]) as any

    console.log(`Ingestion completed. Inserted ${inserted} jobs from sources:`, sources)

    // Only fetch newly created jobs if we actually inserted any
    let notifiedJobs = 0
    if (inserted > 0) {
      const created = await prisma.job.findMany({
        where: { createdAt: { gte: before } },
        select: { id: true }
      })

      if (created.length > 0) {
        console.log(`Notifying subscribers for ${created.length} new jobs...`)
        await notifySubscribers(created.map(x => x.id))
        notifiedJobs = created.length
      }
    }

    return Response.json({
      ok: true,
      inserted,
      notifiedJobs,
      sources,
      duration: Date.now() - before.getTime()
    })
  } catch (error) {
    console.error('Cron job failed:', error)
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - (new Date()).getTime()
    }, { status: 500 })
  }
}
