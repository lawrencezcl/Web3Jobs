import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface Job {
  id?: string
  title: string
  company: string
  location: string
  remote: boolean
  salary: string
  employmentType: string
  postedAt?: string
  url: string
  applyUrl?: string
  tags: string[]
  description: string
}

// Function to validate and sanitize job data
function validateAndSanitizeJob(job: any): Job | null {
  try {
    // Basic validation
    if (!job || typeof job !== 'object') {
      return null
    }

    // Required fields
    if (!job.title || typeof job.title !== 'string') return null
    if (!job.company || typeof job.company !== 'string') return null
    if (!job.description || typeof job.description !== 'string') return null

    // Sanitize and build job object
    const sanitizedJob: Job = {
      id: job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: job.title.trim().substring(0, 200),
      company: job.company.trim().substring(0, 100),
      location: job.location || 'Remote',
      remote: Boolean(job.remote),
      salary: job.salary || 'Competitive',
      employmentType: job.employmentType || 'Full-time',
      postedAt: job.postedAt || new Date().toISOString(),
      url: job.url || '#',
      applyUrl: job.applyUrl || job.url || '#',
      tags: Array.isArray(job.tags) ? job.tags.filter(tag => typeof tag === 'string') : [],
      description: job.description.trim().substring(0, 2000)
    }

    // Clean tags
    sanitizedJob.tags = sanitizedJob.tags.map(tag =>
      tag.replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase()
    ).filter(tag => tag.length > 0)

    return sanitizedJob
  } catch (error) {
    console.error('Error validating job:', error)
    return null
  }
}

// Function to post job to channel
async function postJobToChannel(job: Job): Promise<boolean> {
  const token = process.env.JOB_POSTING_TOKEN || 'web3jobs-posting-secret'

  try {
    const response = await fetch('https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/post-job-to-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(job)
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error posting job to channel:', error)
    return false
  }
}

// Function to check if job is suitable for Web3
function isWeb3Job(job: Job): boolean {
  const web3Keywords = [
    'blockchain', 'solidity', 'web3', 'defi', 'nft', 'cryptocurrency',
    'bitcoin', 'ethereum', 'smart contract', 'dapp', 'dao', 'metaverse',
    'gamefi', 'play2earn', 'staking', 'yield', 'liquidity',
    'trading', 'exchange', 'wallet', 'token', 'ico', 'ido'
  ]

  const textToSearch = `${job.title} ${job.company} ${job.description} ${job.tags.join(' ')}`.toLowerCase()

  return web3Keywords.some(keyword => textToSearch.includes(keyword))
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)

  try {
    // Parse the request body
    const body = await request.json()
    console.log(`📥 [${requestId}] Job ingestion request received`)

    // Check authentication
    const authHeader = request.headers.get('authorization')
    const apiKey = request.headers.get('x-api-key')
    const expectedToken = process.env.INGESTION_TOKEN || 'web3jobs-ingestion-secret'

    const isValidAuth = authHeader === `Bearer ${expectedToken}` || apiKey === expectedToken

    if (!isValidAuth) {
      console.log(`❌ [${requestId}] Unauthorized: Invalid token`)
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Validate and sanitize job data
    const job = validateAndSanitizeJob(body)
    if (!job) {
      console.log(`❌ [${requestId}] Invalid job data`)
      return NextResponse.json(
        { error: 'Invalid job data', success: false },
        { status: 400 }
      )
    }

    console.log(`✅ [${requestId}] Job validated: ${job.title} at ${job.company}`)

    // Check if it's a Web3 job
    if (!isWeb3Job(job)) {
      console.log(`⚠️ [${requestId}] Job filtered out (not Web3 related): ${job.title}`)
      return NextResponse.json({
        success: false,
        message: 'Job filtered out - not Web3 related',
        jobId: job.id,
        filtered: true
      })
    }

    // Auto-post to channel
    const postSuccess = await postJobToChannel(job)

    if (postSuccess) {
      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`✅ [${requestId}] Job ingested and posted to channel successfully in ${processingTime}ms`)

      return NextResponse.json({
        success: true,
        message: 'Job ingested and posted to channel successfully',
        jobId: job.id,
        processingTime,
        posted: true,
        channel: '@web3jobs88'
      })
    } else {
      console.log(`⚠️ [${requestId}] Job ingested but failed to post to channel`)

      return NextResponse.json({
        success: true,
        message: 'Job ingested but channel posting failed',
        jobId: job.id,
        posted: false,
        error: 'Channel posting failed'
      })
    }

  } catch (error) {
    const endTime = Date.now()
    const processingTime = endTime - startTime

    console.error(`❌ [${requestId}] Error ingesting job:`, error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        processingTime,
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET endpoint for testing and documentation
export async function GET() {
  return NextResponse.json({
    message: 'Job ingestion API is working',
    endpoints: {
      post: 'POST /api/ingest-job - Ingest a new job and auto-post to channel',
      test: 'GET /api/ingest-job - Test endpoint'
    },
    authentication: 'Bearer token or X-API-Key header required',
    expected_format: {
      title: 'Job title (required)',
      company: 'Company name (required)',
      description: 'Job description (required)',
      location: 'Job location (optional)',
      remote: 'Is remote job? (boolean, optional)',
      salary: 'Salary range (optional)',
      employmentType: 'Employment type (optional)',
      url: 'Job URL (optional)',
      applyUrl: 'Application URL (optional)',
      tags: 'Array of skill tags (optional)'
    },
    web3_filter: 'Jobs are automatically filtered for Web3 relevance',
    auto_post: 'Valid Web3 jobs are automatically posted to @web3jobs88 channel'
  })
}