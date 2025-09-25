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
      // Validate data before saving
      if (!j.title || !j.company || !j.url) {
        continue
      }

      await prisma.job.create({
        data: {
          id: j.id,
          title: j.title.substring(0, 500), // Ensure title fits
          company: j.company.substring(0, 255), // Ensure company fits
          location: j.location ? j.location.substring(0, 255) : null,
          remote: j.remote,
          tags: (j.tags || []).join(','),
          url: j.url.substring(0, 1000), // Ensure URL fits
          source: j.source.substring(0, 100),
          postedAt: j.postedAt || null,
          createdAt: j.createdAt,
          salary: j.salary ? j.salary.substring(0, 255) : null,
          currency: j.currency ? j.currency.substring(0, 10) : null,
          employmentType: j.employmentType ? j.employmentType.substring(0, 100) : null,
          description: j.description ? j.description.substring(0, 5000) : null // Limit description length
        }
      })
      n++
    } catch (error) {
      // Ignore duplicate entries and other errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('Unique constraint') && !errorMessage.includes('duplicate key')) {
        console.warn('Failed to save job:', errorMessage)
      }
    }
  }
  return n
}
