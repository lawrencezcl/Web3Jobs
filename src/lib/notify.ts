import { prisma } from './db'
import { matchTopics } from './utils'

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
  })
}

async function sendDiscord(webhook: string, text: string) {
  if (!/^https:\/\/discord.com\/api\/webhooks\//.test(webhook)) return
  await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: text })
  })
}

export async function notifySubscribers(newJobIds: string[]) {
  if (!newJobIds.length) return
  const subs = await prisma.subscriber.findMany()
  if (!subs.length) return

  const jobs = await prisma.job.findMany({
    where: { id: { in: newJobIds } },
    orderBy: { postedAt: 'desc' }
  })

  for (const s of subs) {
    const topics = (s.topics || '').split(',').map(t=>t.trim()).filter(Boolean)
    const matched = topics.length
      ? jobs.filter(j => matchTopics([j.title,j.company,j.tags||'',j.description||''].join(' '), topics))
      : jobs

    for (const j of matched.slice(0, 10)) {
      const text = `**${j.title}** @ ${j.company}\n${j.location || 'Remote'} • ${j.source}\n${j.url}`
      if (s.type === 'telegram') await sendTelegram(s.identifier, text.replace(/\*\*/g,''))
      else if (s.type === 'discord') await sendDiscord(s.identifier, text)
    }
  }
}
