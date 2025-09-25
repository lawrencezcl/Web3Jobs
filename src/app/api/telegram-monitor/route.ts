export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Store recent webhook calls in memory for debugging
const webhookCalls: Array<{
  id: string
  timestamp: string
  method: string
  url: string
  userAgent: string
  chatId?: string
  text?: string
  processed: boolean
  responseSent: boolean
}> = []

export async function POST(req: Request) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)

  // Log every webhook call
  const callLog: any = {
    id: requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.headers.get('user-agent') || 'unknown',
    processed: false,
    responseSent: false
  }

  try {
    // Try to parse the request body to get chat info
    const body = await req.clone().json()
    if (body.message) {
      callLog.chatId = body.message.chat?.id
      callLog.text = body.message.text
    }
  } catch (e) {
    // If we can't parse JSON, that's okay - we'll still log the request
  }

  webhookCalls.unshift(callLog)

  // Keep only last 100 calls
  if (webhookCalls.length > 100) {
    webhookCalls.pop()
  }

  return Response.json({
    success: true,
    id: requestId,
    message: 'Webhook call logged for monitoring'
  })
}

export async function GET() {
  return Response.json({
    total: webhookCalls.length,
    recentCalls: webhookCalls.slice(0, 20), // Show last 20 calls
    timestamp: new Date().toISOString(),
    status: 'Monitoring active'
  })
}