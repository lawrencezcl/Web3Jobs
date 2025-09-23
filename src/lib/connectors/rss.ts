import { sha256 } from '@/lib/utils'
type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}
// very naive RSS/Atom parsing to avoid extra deps
function pick(text: string, tag: string) {
  const m = text.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)</${tag}>`, 'i'))
  return m ? m[1].replace(/<[^>]+>/g,' ').trim() : ''
}
export async function fetchRSS(feedUrl: string, label='rss'): Promise<Job[]> {
  const res = await fetch(feedUrl, { headers: { 'User-Agent': 'web3-remote-jobs/1.0' } })
  if (!res.ok) return []
  const xml = await res.text()
  const chunks = xml.split(/<item[>\s]|<entry[>\s]/i).slice(1)
  const out: Job[] = []
  for (const ch of chunks) {
    try {
      const title = pick(ch, 'title') || 'Untitled'
      const url = pick(ch, 'link') || ''
      const desc = pick(ch, 'description') || pick(ch, 'content')
      const dateStr = pick(ch, 'pubDate') || pick(ch, 'updated') || pick(ch, 'published')
      const postedAt = dateStr ? new Date(dateStr) : null
      const id = sha256(`${title}|Unknown|${url}`)
      out.push({ id, title, company:'Unknown', location:'', remote:true, tags:[], url, source: label, postedAt, createdAt: new Date(), description: desc })
    } catch {}
  }
  return out
}
