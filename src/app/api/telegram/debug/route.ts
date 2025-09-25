import { prisma } from '../../../../lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing',
      TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    },
    database: {
      connected: false,
      totalJobs: 0,
      error: null
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : null,
      webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET ? process.env.TELEGRAM_WEBHOOK_SECRET.substring(0, 10) + '...' : null,
    }
  }

  // Test database connection
  try {
    const totalJobs = await prisma.job.count()
    debug.database.connected = true
    debug.database.totalJobs = totalJobs
  } catch (error) {
    debug.database.error = error.message
  }

  return Response.json(debug, { status: 200 })
}