export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing',
    telegram_webhook_secret: process.env.TELEGRAM_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
    database_url: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    node_env: process.env.NODE_ENV || '❌ Missing',
    vercel_url: process.env.VERCEL_URL ? '✅ Set' : '❌ Missing'
  })
}