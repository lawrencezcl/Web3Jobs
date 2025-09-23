import { sha256, parseTags, parseSalary, parseSeniorityLevel, parseCountry } from '@/lib/utils'
import { fetchWithRetry, ConnectorError, logConnectorError } from '@/lib/error-handling'
type Job = {
  id: string; title: string; company: string; location?: string; country?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  salaryMin?: number | null; salaryMax?: number | null;
  currency?: string | null; employmentType?: string | null; 
  seniorityLevel?: string | null; description?: string | null;
}

export async function fetchLever(company: string): Promise<Job[]> {
  try {
    const url = `https://api.lever.co/v0/postings/${company}?mode=json`
    const res = await fetchWithRetry(url)
    const data = await res.json() as any[]
    const out: Job[] = []
    
    for (const p of data) {
      try {
        const title: string = p.text || p.title || 'Untitled'
        const comp: string = p.categories?.team || p.company?.name || company
        const href: string = p.hostedUrl || p.applyUrl || ''
        const location: string = p.categories?.location || ''
        const country = parseCountry(location)
        const tags: string[] = parseTags(p.categories?.commitment || p.categories?.team || p.categories?.department)
        const remote = /remote/i.test(location) || /remote/i.test(title)
        const description: string = p.descriptionPlain || ''
        const postedAt = p.createdAt ? new Date(p.createdAt) : null
        const salaryText = p.salaryDescription || ''
        const { min: salaryMin, max: salaryMax, currency } = parseSalary(salaryText)
        const seniorityLevel = parseSeniorityLevel(title, description)
        const id = sha256(`${title}|${comp}|${href}`)
        out.push({ 
          id, title, company: comp, location, country: country || undefined, remote, tags, url: href, 
          source: 'lever', postedAt, createdAt: new Date(), description,
          salary: salaryText || undefined, salaryMin: salaryMin || undefined, 
          salaryMax: salaryMax || undefined, currency: currency || undefined, 
          seniorityLevel: seniorityLevel || undefined
        })
      } catch (error) {
        logConnectorError('lever', error as Error, { company, posting: p })
        // Continue processing other jobs
      }
    }
    return out
  } catch (error) {
    const connectorError = new ConnectorError(
      `Failed to fetch jobs from Lever for company: ${company}`,
      'lever',
      error as Error
    )
    logConnectorError('lever', connectorError, { company })
    return [] // Return empty array instead of throwing
  }
}
