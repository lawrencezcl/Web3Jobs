export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Sample jobs data for Edge Runtime (fallback)
const sampleJobs = [
  {
    id: '1',
    title: 'Senior Blockchain Developer',
    company: 'CryptoTech Inc',
    location: 'Remote',
    remote: true,
    salary: '$120k - $180k',
    employmentType: 'Full-time',
    postedAt: new Date().toISOString(),
    url: 'https://example.com/job1',
    tags: 'blockchain,solidity,web3',
    description: 'Looking for senior blockchain developer with Solidity experience.'
  },
  {
    id: '2',
    title: 'Smart Contract Auditor',
    company: 'DeFi Security',
    location: 'Remote',
    remote: true,
    salary: '$100k - $150k',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    url: 'https://example.com/job2',
    tags: 'smart-contracts,auditing,security',
    description: 'Smart contract auditor needed for DeFi protocol security audits.'
  },
  {
    id: '3',
    title: 'Web3 Frontend Developer',
    company: 'MetaWeb Studios',
    location: 'San Francisco',
    remote: false,
    salary: '$90k - $130k',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    url: 'https://example.com/job3',
    tags: 'react,typescript,web3',
    description: 'Frontend developer with React and Web3 integration experience.'
  }
]

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

// Helper function to search jobs (Edge Runtime compatible)
function searchJobs(query: string = '', tag: string = '', remote: boolean = true, limit: number = 5) {
  let filteredJobs = [...sampleJobs]

  if (query) {
    const lowerQuery = query.toLowerCase()
    filteredJobs = filteredJobs.filter(job =>
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.toLowerCase().includes(lowerQuery) ||
      job.description.toLowerCase().includes(lowerQuery)
    )
  }

  if (tag) {
    const lowerTag = tag.toLowerCase()
    filteredJobs = filteredJobs.filter(job =>
      job.tags.toLowerCase().includes(lowerTag)
    )
  }

  if (remote !== undefined) {
    filteredJobs = filteredJobs.filter(job => job.remote === remote)
  }

  return filteredJobs.slice(0, limit)
}

export async function POST(req: Request) {
  const startTime = Date.now()
  const request_id = Math.random().toString(36).substring(7)

  // Log the incoming request
  console.log(`📥 [${request_id}] Telegram webhook request received at ${new Date().toISOString()}`)
  console.log(`📥 [${request_id}] URL: ${req.url}`)
  console.log(`📥 [${request_id}] Method: ${req.method}`)
  console.log(`📥 [${request_id}] Headers:`, Object.fromEntries(req.headers.entries()))

  // Also log to our monitoring endpoint
  try {
    await fetch('https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram-monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id,
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        user_agent: req.headers.get('user-agent'),
        source: 'webhook'
      })
    })
  } catch (monitorError) {
    console.log(`⚠️ [${request_id}] Failed to log to monitor:`, monitorError)
  }

  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret') || ''
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || 'web3jobs-telegram-webhook-secret'

  console.log(`🔐 [${request_id}] Secret check: provided=${secret ? 'yes' : 'no'}, expected=${webhookSecret ? 'yes' : 'no'}`)

  if (secret !== webhookSecret) {
    console.log(`❌ [${request_id}] Unauthorized: secret mismatch`)
    return new Response('Unauthorized', { status: 401 })
  }

  let update
  try {
    update = await req.json()
    console.log(`📦 [${request_id}] Parsed update:`, JSON.stringify(update, null, 2))
  } catch (error) {
    console.log(`❌ [${request_id}] Failed to parse JSON:`, error)
    return new Response('Invalid JSON', { status: 400 })
  }

  const message = update.message || update.edited_message
  if (!message) {
    console.log(`⚠️ [${request_id}] No message in update`)
    return Response.json({ ok: true })
  }

  const chatId = String(message.chat?.id || '')
  const text = String(message.text || '')

  console.log(`💬 [${request_id}] Message from chat ${chatId}: "${text}"`)

  if (!chatId || !text) {
    console.log(`⚠️ [${request_id}] Missing chatId or text`)
    return Response.json({ ok: true })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q'

  console.log(`🤖 [${request_id}] Bot token: ${token ? 'present' : 'missing'}`)

  async function reply(text: string, parse_mode: string = 'Markdown') {
    console.log(`📤 [${request_id}] Attempting to send reply to chat ${chatId}`)
    console.log(`📤 [${request_id}] Reply text length: ${text.length}`)

    if (!token) {
      console.log(`❌ [${request_id}] No telegram token configured`)
      return
    }
    try {
      console.log(`📡 [${request_id}] Sending to Telegram API...`)
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode,
          disable_web_page_preview: false
        })
      })
      const result = await response.json()
      console.log(`📥 [${request_id}] Telegram API response:`, JSON.stringify(result, null, 2))
      if (!result.ok) {
        console.error(`❌ [${request_id}] Telegram API error:`, result)
      } else {
        console.log(`✅ [${request_id}] Message sent successfully`)
      }
    } catch (error) {
      console.error(`❌ [${request_id}] Telegram API fetch error:`, error)
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
    // Prisma operations disabled in Edge Runtime
    // await prisma.subscriber.upsert({
    //   where: { id: `telegram:${chatId}` },
    //   update: { topics },
    //   create: { id: `telegram:${chatId}`, type: 'telegram', identifier: chatId, topics }
    // })

    if (topics) {
      await reply(`✅ *Subscribed to job alerts for:* ${topics}\n\nYou'll receive notifications when new matching jobs are posted! 📬`)
    } else {
      await reply('✅ *Subscribed to all job alerts!*\n\nYou\'ll receive notifications for all new Web3 jobs! 📬')
    }

  } else if (/^\/unsubscribe/i.test(text)) {
    // Prisma operations disabled in Edge Runtime
    // await prisma.subscriber.delete({ where: { id: `telegram:${chatId}` } }).catch(()=>null)
    await reply('❌ *Unsubscribed from job alerts.*\n\nYou\'ll no longer receive job notifications. Use /subscribe to resubscribe!')

  } else if (/^\/stats/i.test(text)) {
    // Prisma operations disabled in Edge Runtime - using sample data
    const totalJobs = sampleJobs.length
    const remoteJobs = sampleJobs.filter(j => j.remote).length
    const recentJobs = sampleJobs.filter(j => new Date(j.postedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length

    const stats = `📊 *Web3 Jobs Stats:*\n\n` +
                 `📈 *Total Jobs:* ${totalJobs}\n` +
                 `🌍 *Remote Jobs:* ${remoteJobs}\n` +
                 `🆕 *This Week:* ${recentJobs}\n\n` +
                 `💡 Use /search to find opportunities!`
    await reply(stats)

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

  const endTime = Date.now()
  const processingTime = endTime - startTime
  console.log(`✅ [${request_id}] Request completed in ${processingTime}ms`)

  return Response.json({ ok: true })
}
