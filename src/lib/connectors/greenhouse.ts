import { sha256, parseTags } from '../utils'
type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}
export async function fetchGreenhouse(board: string): Promise<Job[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`
  const res = await fetch(url, { headers: { 'User-Agent': 'web3-remote-jobs/1.0' } })
  if (!res.ok) return []
  const json = await res.json() as any
  const data = json.jobs || []
  const out: Job[] = []
  for (const j of data) {
    try {
      const title: string = j.title || 'Untitled'
      const company = board
      const href: string = j.absolute_url || ''
      const location: string = j.location?.name || ''
      const tags: string[] = parseTags((j.departments||[]).map((d:any)=>d.name))
      const remote = /remote/i.test(location) || /remote/i.test(title)
      const description: string = (j.content && typeof j.content === 'string')
        ? j.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        : ''
      const postedAt = j.updated_at ? new Date(j.updated_at) : null
      const id = sha256(`${title}|${company}|${href}`)
      out.push({ id, title, company, location, remote, tags, url: href, source: 'greenhouse', postedAt, createdAt: new Date(), description })
    } catch {}
  }
  return out
}
