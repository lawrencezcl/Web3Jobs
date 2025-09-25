export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory store for recent webhook requests (for debugging)
const recentRequests: Array<{
  id: string
  timestamp: string
  chatId: string
  text: string
  method: string
  url: string
  userAgent: string
}> = []

export async function POST(req: Request) {
  // This endpoint can be used to manually log webhook requests for debugging
  const body = await req.json()

  const logEntry = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    ...body
  }

  recentRequests.unshift(logEntry)

  // Keep only last 50 requests
  if (recentRequests.length > 50) {
    recentRequests.pop()
  }

  return Response.json({ success: true, id: logEntry.id })
}

export async function GET() {
  return Response.json({
    total: recentRequests.length,
    requests: recentRequests,
    message: 'This endpoint shows recent webhook requests for debugging purposes'
  })
}