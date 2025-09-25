import { prisma } from '../../../../lib/db'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper function to format job for Telegram
function formatJobForTelegram(job: any) {
  const maxLength = 4000 // Telegram message limit
  let message = `🚀 *${job.title}*\n`
  message += `🏢 ${job.company}\n`

  if (job.location && job.location !== 'Remote') {
    message += `📍 ${job.location}\n`
  }
  if (job.remote) {
    message += `🌍 Remote\n`
  }

  if (job.salary) {
    message += `💰 ${job.salary}\n`
  }

  if (job.employmentType) {
    message += `📋 ${job.employmentType}\n`
  }

  message += `📅 Posted: ${new Date(job.postedAt).toLocaleDateString()}\n`
  message += `🔗 [Apply Now](${job.url})\n`

  // Add tags if available
  if (job.tags) {
    const tags = job.tags.split(',').slice(0, 5).map((tag: string) => `#${tag.trim()}`).join(' ')
    message += `\n🏷️ ${tags}`
  }

  // Add description preview (truncated)
  if (job.description && job.description.length > 0) {
    const cleanDescription = job.description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Replace HTML entities
      .trim()

    if (cleanDescription.length > 200) {
      message += `\n\n💼 *Description:*\n${cleanDescription.substring(0, 200)}...`
    } else if (cleanDescription.length > 0) {
      message += `\n\n💼 *Description:*\n${cleanDescription}`
    }
  }

  // Ensure message doesn't exceed Telegram limit
  if (message.length > maxLength) {
    message = message.substring(0, maxLength - 3) + '...'
  }

  return message
}

// Helper function to search jobs
async function searchJobs(query: string = '', tag: string = '', remote: boolean = true, limit: number = 5) {
  const where: any = {}

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { company: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } }
    ]
  }

  if (tag) {
    where.tags = { contains: tag, mode: 'insensitive' }
  }

  if (remote !== undefined) {
    where.remote = remote
  }

  return await prisma.job.findMany({
    where,
    orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit
  })
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret') || ''
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }
  const update = await req.json()

  const message = update.message || update.edited_message
  if (!message) return Response.json({ ok: true })

  const chatId = String(message.chat?.id || '')
  const text = String(message.text || '')
  if (!chatId || !text) return Response.json({ ok: true })

  const token = process.env.TELEGRAM_BOT_TOKEN

  async function reply(text: string, parse_mode: string = 'Markdown') {
    if (!token) return
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode,
          disable_web_page_preview: false
        })
      })
    } catch (error) {
      console.error('Telegram API error:', error)
    }
  }

  async function sendJobs(jobs: any[], title: string = '') {
    if (jobs.length === 0) {
      await reply('🔍 No jobs found matching your criteria.')
      return
    }

    await reply(`${title}🔍 Found ${jobs.length} job${jobs.length > 1 ? 's' : ''}:\n`)

    for (const job of jobs) {
      const jobMessage = formatJobForTelegram(job)
      await reply(jobMessage)
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Command handlers
  if (/^\/start/i.test(text)) {
    const welcome = `🌟 *Welcome to Web3 Jobs Bot!*

🔍 *Available Commands:*
• /search [query] - Search jobs (e.g., /search solidity)
• /remote - Show remote jobs only
• /latest - Show latest 5 jobs
• /tags [tag] - Search by tags (e.g., /tags react)
• /subscribe [topics] - Get job alerts (e.g., /subscribe defi,nft)
• /unsubscribe - Stop job alerts
• /help - Show this help message

💡 *Examples:*
/search senior developer blockchain
/remote
/tags solidity
/subscribe smart-contracts,defi

Start exploring Web3 opportunities! 🚀`
    await reply(welcome)

  } else if (/^\/help/i.test(text)) {
    const help = `🤖 *Web3 Jobs Bot Help*

*Search Commands:*
• /search [query] - Search jobs by title/company/description
• /remote - Show only remote jobs
• /latest - Show 5 most recent jobs
• /tags [tag] - Find jobs by specific tags

*Subscription Commands:*
• /subscribe [topics] - Get alerts for specific topics
• /unsubscribe - Stop receiving alerts

*Examples:*
/search solidity developer
/remote
/tags react
/subscribe defi,nft,blockchain

💡 *Tips:*
• Use specific terms for better results
• Combine search with tags for precision
• Subscribe to get daily job alerts!`
    await reply(help)

  } else if (/^\/search\s*/i.test(text)) {
    const query = text.replace(/^\/search\s*/i, '').trim()
    if (!query) {
      await reply('🔍 Please provide a search term. Example: /search solidity developer')
      return
    }

    const jobs = await searchJobs(query)
    await sendJobs(jobs, `🔍 Search results for "${query}":\n\n`)

  } else if (/^\/remote$/i.test(text)) {
    const jobs = await searchJobs('', '', true, 5)
    await sendJobs(jobs, '🌍 *Latest Remote Jobs:*\n\n')

  } else if (/^\/latest$/i.test(text)) {
    const jobs = await searchJobs('', '', undefined, 5)
    await sendJobs(jobs, '🆕 *Latest Jobs:*\n\n')

  } else if (/^\/tags\s*/i.test(text)) {
    const tag = text.replace(/^\/tags\s*/i, '').trim()
    if (!tag) {
      await reply('🏷️ Please provide a tag. Example: /tags react')
      return
    }

    const jobs = await searchJobs('', tag, undefined, 5)
    await sendJobs(jobs, `🏷️ *Jobs with tag "${tag}":*\n\n`)

  } else if (/^\/subscribe\s*/i.test(text)) {
    const topics = text.replace(/^\/subscribe\s*/i, '').trim()
    await prisma.subscriber.upsert({
      where: { id: `telegram:${chatId}` },
      update: { topics },
      create: { id: `telegram:${chatId}`, type: 'telegram', identifier: chatId, topics }
    })

    if (topics) {
      await reply(`✅ *Subscribed to job alerts for:* ${topics}\n\nYou'll receive notifications when new matching jobs are posted! 📬`)
    } else {
      await reply('✅ *Subscribed to all job alerts!*\n\nYou\'ll receive notifications for all new Web3 jobs! 📬')
    }

  } else if (/^\/unsubscribe/i.test(text)) {
    await prisma.subscriber.delete({ where: { id: `telegram:${chatId}` } }).catch(()=>null)
    await reply('❌ *Unsubscribed from job alerts.*\n\nYou\'ll no longer receive job notifications. Use /subscribe to resubscribe!')

  } else if (/^\/stats/i.test(text)) {
    try {
      const totalJobs = await prisma.job.count()
      const remoteJobs = await prisma.job.count({ where: { remote: true } })
      const recentJobs = await prisma.job.count({
        where: { postedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      })

      const stats = `📊 *Web3 Jobs Stats:*\n\n` +
                   `📈 *Total Jobs:* ${totalJobs}\n` +
                   `🌍 *Remote Jobs:* ${remoteJobs}\n` +
                   `🆕 *This Week:* ${recentJobs}\n\n` +
                   `💡 Use /search to find opportunities!`
      await reply(stats)
    } catch (error) {
      await reply('❌ Sorry, unable to fetch stats right now.')
    }

  } else {
    // Fallback for unknown commands or general messages
    const fallback = `🤖 I didn't understand that. Try these commands:\n\n` +
                     `• /search [query] - Find jobs\n` +
                     `• /remote - Remote jobs\n` +
                     `• /latest - Recent jobs\n` +
                     `• /tags [tag] - Jobs by tag\n` +
                     `• /subscribe [topics] - Get alerts\n` +
                     `• /help - More info`
    await reply(fallback, undefined)
  }

  return Response.json({ ok: true })
}
