import { sha256, parseTags } from '@/lib/utils'
type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}
export async function fetchRemoteOK(): Promise<Job[]> {
  const res = await fetch('https://remoteok.com/api', { headers: { 'User-Agent': 'web3-remote-jobs/1.0' } })
  if (!res.ok) return []
  const arr = await res.json() as any[]
  const data = Array.isArray(arr) ? arr.slice(1) : []
  const out: Job[] = []
  for (const j of data) {
    try {
      const tagsArr = Array.isArray(j.tags) ? j.tags : []
      const isWeb3 = tagsArr.some((t:string)=>/web3|crypto|blockchain/i.test(t)) || /web3|crypto|blockchain/i.test(j.position || '')
      if (!isWeb3) continue
      const title: string = j.position || 'Untitled'
      const company: string = j.company || 'Unknown'
      const href: string = j.url || j.apply_url || ''
      const location: string = String(j.location || '')
      const tags: string[] = parseTags(tagsArr)
      const postedAt = j.epoch ? new Date(Number(j.epoch)*1000) : null
      const id = sha256(`${title}|${company}|${href}`)
      out.push({ id, title, company, location, remote: true, tags, url: href, source: 'remoteok', postedAt, createdAt: new Date(), salary: j.salary || null, description: j.description ? String(j.description).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() : null })
    } catch {}
  }
  return out
}
