import { prisma } from '@/lib/db'
import { config } from '@/lib/config'
import { fetchLever } from '@/lib/connectors/lever'
import { fetchGreenhouse } from '@/lib/connectors/greenhouse'
import { fetchRemoteOK } from '@/lib/connectors/remoteok'
import { fetchRSS } from '@/lib/connectors/rss'

export async function ingestAll() {
  const sources: string[] = []
  let inserted = 0

  for (const comp of config.lever_companies) {
    const jobs = await fetchLever(comp)
    inserted += await saveJobs(jobs)
    sources.push(`lever:${comp}`)
  }
  for (const board of config.greenhouse_boards) {
    const jobs = await fetchGreenhouse(board)
    inserted += await saveJobs(jobs)
    sources.push(`greenhouse:${board}`)
  }
  if (config.enable_remoteok) {
    const jobs = await fetchRemoteOK()
    inserted += await saveJobs(jobs)
    sources.push('remoteok')
  }
  for (const feed of config.rss_feeds) {
    const jobs = await fetchRSS(feed, 'rss')
    inserted += await saveJobs(jobs)
    sources.push(`rss:${feed}`)
  }

  return { inserted, sources }
}

type InJob = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}

async function saveJobs(jobs: InJob[]) {
  if (!jobs.length) return 0
  let n = 0
  for (const j of jobs) {
    try {
      await prisma.job.create({
        data: {
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location || null,
          remote: j.remote,
          tags: (j.tags || []).join(','),
          url: j.url,
          source: j.source,
          postedAt: j.postedAt || null,
          createdAt: j.createdAt,
          salary: j.salary || null,
          currency: j.currency || null,
          employmentType: j.employmentType || null,
          description: j.description || null
        }
      }).catch(()=>null)
      n++
    } catch {}
  }
  return n
}
