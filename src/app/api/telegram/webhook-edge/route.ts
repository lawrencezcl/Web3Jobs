export const runtime = 'edge'
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

// Sample jobs data for Edge Runtime (since we can't use Prisma in Edge)
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

// Helper function to search jobs (simplified for Edge Runtime)
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

  try {
    // Parse the request
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret') || ''
    const webhookSecret = 'web3jobs-telegram-webhook-secret' // Using hardcoded secret for Edge

    if (secret !== webhookSecret) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const message = body.message || body.edited_message

    if (!message) {
      return Response.json({ ok: true })
    }

    const chatId = String(message.chat?.id || '')
    const text = String(message.text || '')

    if (!chatId || !text) {
      return Response.json({ ok: true })
    }

    const token = '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q'

    // Log the request (simplified for Edge)
    console.log(`📥 [${request_id}] Edge webhook: ${chatId} - "${text}"`)

    // Helper function to send messages
    async function sendTelegramMessage(chatId: string, text: string, parse_mode: string = 'Markdown') {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode,
            disable_web_page_preview: false
          })
        })

        const result = await response.json()
        if (!result.ok) {
          console.error(`❌ [${request_id}] Telegram API error:`, result)
        }
        return result
      } catch (error) {
        console.error(`❌ [${request_id}] Telegram API fetch error:`, error)
        return { ok: false }
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
      await sendTelegramMessage(chatId, welcome)

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
      await sendTelegramMessage(chatId, help)

    } else if (/^\/search\s*/i.test(text)) {
      const query = text.replace(/^\/search\s*/i, '').trim()
      if (!query) {
        await sendTelegramMessage(chatId, '🔍 Please provide a search term. Example: /search solidity developer')
        return Response.json({ ok: true })
      }

      const jobs = searchJobs(query)
      if (jobs.length === 0) {
        await sendTelegramMessage(chatId, '🔍 No jobs found matching your criteria.')
      } else {
        await sendTelegramMessage(chatId, `🔍 Search results for "${query}":\n\nFound ${jobs.length} job${jobs.length > 1 ? 's' : ''}:`)
        for (const job of jobs) {
          const jobMessage = formatJobForTelegram(job)
          await sendTelegramMessage(chatId, jobMessage)
        }
      }

    } else if (/^\/remote$/i.test(text)) {
      const jobs = searchJobs('', '', true, 5)
      if (jobs.length === 0) {
        await sendTelegramMessage(chatId, '🌍 No remote jobs found at the moment.')
      } else {
        await sendTelegramMessage(chatId, '🌍 *Latest Remote Jobs:*\n\n')
        for (const job of jobs) {
          const jobMessage = formatJobForTelegram(job)
          await sendTelegramMessage(chatId, jobMessage)
        }
      }

    } else if (/^\/latest$/i.test(text)) {
      const jobs = searchJobs('', '', undefined, 5)
      if (jobs.length === 0) {
        await sendTelegramMessage(chatId, '🆕 No jobs found at the moment.')
      } else {
        await sendTelegramMessage(chatId, '🆕 *Latest Jobs:*\n\n')
        for (const job of jobs) {
          const jobMessage = formatJobForTelegram(job)
          await sendTelegramMessage(chatId, jobMessage)
        }
      }

    } else if (/^\/tags\s*/i.test(text)) {
      const tag = text.replace(/^\/tags\s*/i, '').trim()
      if (!tag) {
        await sendTelegramMessage(chatId, '🏷️ Please provide a tag. Example: /tags react')
        return Response.json({ ok: true })
      }

      const jobs = searchJobs('', tag, undefined, 5)
      if (jobs.length === 0) {
        await sendTelegramMessage(chatId, `🏷️ No jobs found with tag "${tag}".`)
      } else {
        await sendTelegramMessage(chatId, `🏷️ *Jobs with tag "${tag}":*\n\n`)
        for (const job of jobs) {
          const jobMessage = formatJobForTelegram(job)
          await sendTelegramMessage(chatId, jobMessage)
        }
      }

    } else if (/^\/stats/i.test(text)) {
      const stats = `📊 *Web3 Jobs Stats:*\n\n` +
                   `📈 *Total Jobs:* ${sampleJobs.length}\n` +
                   `🌍 *Remote Jobs:* ${sampleJobs.filter(j => j.remote).length}\n` +
                   `🆕 *This Week:* ${sampleJobs.filter(j => new Date(j.postedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}\n\n` +
                   `💡 Use /search to find opportunities!`
      await sendTelegramMessage(chatId, stats)

    } else {
      // Fallback for unknown commands
      const fallback = `🤖 I didn't understand that. Try these commands:\n\n` +
                       `• /search [query] - Find jobs\n` +
                       `• /remote - Remote jobs\n` +
                       `• /latest - Recent jobs\n` +
                       `• /tags [tag] - Jobs by tag\n` +
                       `• /help - More info`
      await sendTelegramMessage(chatId, fallback)
    }

    const endTime = Date.now()
    const processingTime = endTime - startTime
    console.log(`✅ [${request_id}] Edge webhook completed in ${processingTime}ms`)

    return Response.json({ ok: true })

  } catch (error) {
    console.error(`❌ [${request_id}] Edge webhook error:`, error)
    return Response.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}