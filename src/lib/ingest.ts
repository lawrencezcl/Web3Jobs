import { prisma } from './db'
import { config } from './config'
import { fetchLever } from './connectors/lever'
import { fetchGreenhouse } from './connectors/greenhouse'
import { fetchRemoteOK } from './connectors/remoteok'
import { fetchRSS } from './connectors/rss'
import { logConnectorError } from './error-handling'

export async function ingestAll() {
  const sources: string[] = []
  let inserted = 0
  const errors: string[] = []

  // Execute sources in parallel for better performance
  const promises = []

  // Lever companies
  for (const comp of config.lever_companies) {
    promises.push(
      fetchLever(comp)
        .then(jobs => {
          const count = saveJobs(jobs)
          sources.push(`lever:${comp}`)
          return count
        })
        .catch(error => {
          errors.push(`lever:${comp}: ${error.message}`)
          logConnectorError('lever', error, { company: comp })
          return 0
        })
    )
  }

  // Greenhouse boards
  for (const board of config.greenhouse_boards) {
    promises.push(
      fetchGreenhouse(board)
        .then(jobs => {
          const count = saveJobs(jobs)
          sources.push(`greenhouse:${board}`)
          return count
        })
        .catch(error => {
          errors.push(`greenhouse:${board}: ${error.message}`)
          logConnectorError('greenhouse', error, { board })
          return 0
        })
    )
  }

  // RemoteOK
  if (config.enable_remoteok) {
    promises.push(
      fetchRemoteOK()
        .then(jobs => {
          const count = saveJobs(jobs)
          sources.push('remoteok')
          return count
        })
        .catch(error => {
          errors.push(`remoteok: ${error.message}`)
          logConnectorError('remoteok', error)
          return 0
        })
    )
  }

  // RSS feeds
  for (const feed of config.rss_feeds) {
    promises.push(
      fetchRSS(feed, 'rss')
        .then(jobs => {
          const count = saveJobs(jobs)
          sources.push(`rss:${feed}`)
          return count
        })
        .catch(error => {
          errors.push(`rss:${feed}: ${error.message}`)
          logConnectorError('rss', error, { feed })
          return 0
        })
    )
  }

  // Execute all promises and sum results
  const results = await Promise.allSettled(promises)
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      inserted += result.value
    }
  })

  // Log any errors
  if (errors.length > 0) {
    console.warn('Ingestion completed with errors:', errors)
  }

  return { inserted, sources, errors: errors.length }
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
      })
      n++
    } catch (error) {
      // Ignore duplicate entries and other errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('Unique constraint')) {
        console.warn('Failed to save job:', errorMessage)
      }
    }
  }
  return n
}
