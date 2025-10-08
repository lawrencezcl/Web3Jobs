import { ingestAll } from '../../../lib/ingest'
import { prisma } from '../../../lib/db'
import { notifySubscribers } from '../../../lib/notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max execution time

// Function to post job to Telegram channel
async function postJobToChannel(job: any): Promise<boolean> {
  try {
    const token = process.env.JOB_POSTING_TOKEN || 'web3jobs-posting-secret'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/post-job-to-channel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location || 'Remote',
        remote: job.remote,
        salary: job.salary || 'Competitive',
        employmentType: job.employmentType || 'Full-time',
        postedAt: job.postedAt || job.createdAt,
        url: job.url,
        applyUrl: job.url,
        tags: job.tags ? job.tags.split(',').filter((tag: string) => tag.trim()) : [],
        description: job.description || 'No description provided'
      })
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error posting job to channel:', error)
    return false
  }
}

// Function to check if job is Web3-related
function isWeb3Job(job: any): boolean {
  const web3Keywords = [
    'blockchain', 'solidity', 'web3', 'defi', 'nft', 'cryptocurrency',
    'bitcoin', 'ethereum', 'smart contract', 'dapp', 'dao', 'metaverse',
    'gamefi', 'play2earn', 'staking', 'yield', 'liquidity',
    'trading', 'exchange', 'wallet', 'token', 'ico', 'ido'
  ]

  const textToSearch = `${job.title} ${job.company} ${job.description || ''} ${job.tags || ''}`.toLowerCase()
  return web3Keywords.some(keyword => textToSearch.includes(keyword))
}

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
    const { inserted, sources, errors } = await Promise.race([ingestionPromise, timeoutPromise]) as any

    console.log(`Ingestion completed. Inserted ${inserted} jobs from ${sources.length} sources with ${errors} errors`)

    // Only fetch newly created jobs if we actually inserted any
    let notifiedJobs = 0
    let postedToChannel = 0
    if (inserted > 0) {
      const created = await prisma.job.findMany({
        where: { createdAt: { gte: before } }
      })

      if (created.length > 0) {
        console.log(`Processing ${created.length} new jobs...`)

        // Notify subscribers
        console.log(`Notifying subscribers for ${created.length} new jobs...`)
        await notifySubscribers(created.map(x => x.id))
        notifiedJobs = created.length

        // Post Web3 jobs to Telegram channel
        console.log('Filtering and posting Web3 jobs to Telegram channel...')
        for (const job of created) {
          if (isWeb3Job(job)) {
            console.log(`Posting Web3 job to channel: ${job.title} at ${job.company}`)
            const success = await postJobToChannel(job)
            if (success) {
              postedToChannel++
              console.log(`✅ Successfully posted: ${job.title}`)
            } else {
              console.log(`❌ Failed to post: ${job.title}`)
            }
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }
    }

    return Response.json({
      ok: true,
      inserted,
      notifiedJobs,
      postedToChannel,
      sources,
      errors,
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
