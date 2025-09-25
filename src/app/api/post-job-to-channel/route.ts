import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  salary: string
  employmentType: string
  postedAt: string
  url: string
  applyUrl: string
  tags: string[]
  description: string
}

interface TelegramWebApp {
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  openLink: (url: string) => void
  close: () => void
  ready: () => void
  expand: () => void
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
    setText: (text: string) => void
    setParams: (params: { text?: string; color?: string; text_color?: string }) => void
  }
  sendData: (data: string) => void
  openTelegramLink: (url: string) => void
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  openInvoice: (url: string, callback: (status: string) => void) => void
}

// Function to format job for Telegram channel
function formatJobForChannel(job: Job): string {
  const message = `🚀 *${job.title}*

🏢 *Company:* ${job.company}
💰 *Salary:* ${job.salary}
📍 *Location:* ${job.remote ? 'Remote' : job.location}
📅 *Type:* ${job.employmentType}
⏰ *Posted:* ${new Date(job.postedAt).toLocaleDateString()}

📝 *Description:*
${job.description}

🏷️ *Skills:* ${job.tags.map(tag => `#${tag}`).join(' ')}

🔗 *Apply:* [Click Here](${job.applyUrl})
📱 *View in App:* [Open Mini App](https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/mini-app)

---
*Follow @Web3job88bot for more Web3 opportunities*`

  return message
}

// Function to send message to Telegram channel
async function sendToTelegramChannel(message: string, chatId: string = '@web3jobs88'): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q'

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    })

    const result = await response.json()

    if (result.ok) {
      console.log('✅ Message sent to channel successfully')
      return true
    } else {
      console.error('❌ Failed to send message to channel:', result)
      return false
    }
  } catch (error) {
    console.error('❌ Error sending message to channel:', error)
    return false
  }
}

// Function to validate job data
function validateJob(job: any): job is Job {
  return (
    job &&
    typeof job.id === 'string' &&
    typeof job.title === 'string' &&
    typeof job.company === 'string' &&
    typeof job.location === 'string' &&
    typeof job.remote === 'boolean' &&
    typeof job.salary === 'string' &&
    typeof job.employmentType === 'string' &&
    typeof job.postedAt === 'string' &&
    typeof job.url === 'string' &&
    typeof job.applyUrl === 'string' &&
    Array.isArray(job.tags) &&
    typeof job.description === 'string'
  )
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)

  try {
    // Parse the request body
    const body = await request.json()
    console.log(`📥 [${requestId}] Job posting request received`)

    // Check authentication
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.JOB_POSTING_TOKEN || 'web3jobs-posting-secret'

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.log(`❌ [${requestId}] Unauthorized: Invalid token`)
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    // Validate job data
    if (!validateJob(body)) {
      console.log(`❌ [${requestId}] Invalid job data`)
      return NextResponse.json(
        { error: 'Invalid job data', success: false },
        { status: 400 }
      )
    }

    const job: Job = body

    // Format message for Telegram
    const message = formatJobForChannel(job)
    console.log(`📝 [${requestId}] Formatted message for channel`)

    // Send to Telegram channel
    const channelSuccess = await sendToTelegramChannel(message)

    if (channelSuccess) {
      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`✅ [${requestId}] Job posted to channel successfully in ${processingTime}ms`)

      return NextResponse.json({
        success: true,
        message: 'Job posted to channel successfully',
        jobId: job.id,
        processingTime
      })
    } else {
      console.log(`❌ [${requestId}] Failed to post job to channel`)
      return NextResponse.json(
        { error: 'Failed to post job to channel', success: false },
        { status: 500 }
      )
    }

  } catch (error) {
    const endTime = Date.now()
    const processingTime = endTime - startTime

    console.error(`❌ [${requestId}] Error processing job posting:`, error)

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

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Job posting to channel API is working',
    endpoints: {
      post: 'POST /api/post-job-to-channel - Post a job to the Telegram channel',
      test: 'GET /api/post-job-to-channel - Test endpoint'
    },
    channel: '@web3jobs88',
    instructions: 'Send POST request with job data and Bearer token to post jobs to channel'
  })
}