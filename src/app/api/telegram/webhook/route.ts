import { prisma } from '../../../../lib/db'
export const runtime = 'nodejs'

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
  async function reply(text: string) {
    if (!token) return
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    })
  }

  if (/^\/start/i.test(text)) {
    await reply('Welcome! Use /subscribe <topics> to receive alerts, e.g. "/subscribe solidity, zk"')
  } else if (/^\/subscribe\s*/i.test(text)) {
    const topics = text.replace(/^\/subscribe\s*/i, '')
    await prisma.subscriber.upsert({
      where: { id: `telegram:${chatId}` },
      update: { topics },
      create: { id: `telegram:${chatId}`, type: 'telegram', identifier: chatId, topics }
    })
    await reply(`Subscribed with topics: ${topics || '(none)'}`)
  } else if (/^\/unsubscribe/i.test(text)) {
    await prisma.subscriber.delete({ where: { id: `telegram:${chatId}` } }).catch(()=>null)
    await reply('Unsubscribed.')
  } else {
    await reply('Unknown command. Try /subscribe <topics> or /unsubscribe')
  }

  return Response.json({ ok: true })
}
