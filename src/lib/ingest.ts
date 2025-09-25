import { prisma } from './db'
import { config } from './config'
import { fetchLever } from './connectors/lever'
import { fetchGreenhouse } from './connectors/greenhouse'
import { fetchRemoteOK } from './connectors/remoteok'
import { fetchRSS } from './connectors/rss'
import { fetchWellfound } from './connectors/wellfound'
import { fetchTechBoards } from './connectors/techboards'
import { fetchCryptoBoards } from './connectors/cryptoboards'
import { logConnectorError } from './error-handling'

export async function ingestAll() {
  const sources: string[] = []
  let inserted = 0
  const errors: string[] = []

  // Execute sources in parallel for better performance
  const promises = []

  // Lever companies - expanded list
  for (const comp of config.lever_companies) {
    promises.push(
      fetchLever(comp)
        .then(jobs => {
          const filteredJobs = filterAndDeduplicateJobs(jobs)
          const count = saveJobs(filteredJobs)
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

  // Greenhouse boards - expanded list
  for (const board of config.greenhouse_boards) {
    promises.push(
      fetchGreenhouse(board)
        .then(jobs => {
          const filteredJobs = filterAndDeduplicateJobs(jobs)
          const count = saveJobs(filteredJobs)
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

  // RemoteOK - enhanced with better Web3 filtering
  if (config.enable_remoteok) {
    promises.push(
      fetchRemoteOK()
        .then(jobs => {
          const filteredJobs = filterAndDeduplicateJobs(jobs)
          const count = saveJobs(filteredJobs)
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

  // RSS feeds - expanded list
  for (const feed of config.rss_feeds) {
    promises.push(
      fetchRSS(feed, 'rss')
        .then(jobs => {
          const filteredJobs = filterAndDeduplicateJobs(jobs)
          const count = saveJobs(filteredJobs)
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

  // Wellfound (AngelList) - new source
  if (config.wellfound.enabled) {
    promises.push(
      fetchWellfound()
        .then(jobs => {
          const filteredJobs = filterAndDeduplicateJobs(jobs)
          const count = saveJobs(filteredJobs)
          sources.push('wellfound')
          return count
        })
        .catch(error => {
          errors.push(`wellfound: ${error.message}`)
          logConnectorError('wellfound', error)
          return 0
        })
    )
  }

  // Tech boards (HN, GitHub, Stack Overflow) - new source
  promises.push(
    fetchTechBoards()
      .then(jobs => {
        const filteredJobs = filterAndDeduplicateJobs(jobs)
        const count = saveJobs(filteredJobs)
        sources.push('techboards')
        return count
      })
      .catch(error => {
        errors.push(`techboards: ${error.message}`)
        logConnectorError('techboards', error)
        return 0
      })
  )

  // Crypto boards - new source
  promises.push(
    fetchCryptoBoards()
      .then(jobs => {
        const filteredJobs = filterAndDeduplicateJobs(jobs)
        const count = saveJobs(filteredJobs)
        sources.push('cryptoboards')
        return count
      })
      .catch(error => {
        errors.push(`cryptoboards: ${error.message}`)
        logConnectorError('cryptoboards', error)
        return 0
      })
  )

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

  console.log(`✅ Ingestion complete: ${inserted} jobs from ${sources.length} sources`)

  return { inserted, sources, errors: errors.length }
}

type InJob = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}

// Quality filtering and deduplication
function filterAndDeduplicateJobs(jobs: InJob[]): InJob[] {
  if (!jobs.length) return []

  return jobs.filter(job => {
    // Basic validation
    if (!job.title || !job.company || !job.url) {
      return false
    }

    // Quality filters from config
    if (config.require_description && !job.description) {
      return false
    }

    // Filter out jobs with exclude keywords
    const excludeKeywords = config.exclude_keywords || []
    if (excludeKeywords.length > 0) {
      const titleLower = job.title.toLowerCase()
      const descLower = (job.description || '').toLowerCase()
      const hasExcludedKeyword = excludeKeywords.some(keyword =>
        titleLower.includes(keyword) || descLower.includes(keyword)
      )
      if (hasExcludedKeyword) {
        return false
      }
    }

    // Boost jobs with preferred keywords (but don't exclude others)
    const preferredKeywords = config.preferred_keywords || []
    if (preferredKeywords.length > 0) {
      const titleLower = job.title.toLowerCase()
      const descLower = (job.description || '').toLowerCase()
      const hasPreferredKeyword = preferredKeywords.some(keyword =>
        titleLower.includes(keyword) || descLower.includes(keyword)
      )
      if (hasPreferredKeyword) {
        // Add a boost score for preferred jobs (handled in ranking)
        job.tags = [...(job.tags || []), 'preferred']
      }
    }

    // URL validation
    try {
      new URL(job.url)
    } catch {
      return false
    }

    // Title length validation
    if (job.title.length < 10 || job.title.length > 500) {
      return false
    }

    // Company name validation
    if (job.company.length < 2 || job.company.length > 255) {
      return false
    }

    // Filter out very old jobs (older than 90 days)
    if (job.postedAt) {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      if (job.postedAt < ninetyDaysAgo) {
        return false
      }
    }

    return true
  })
}

async function saveJobs(jobs: InJob[]) {
  if (!jobs.length) return 0

  let n = 0
  let skipped = 0

  for (const j of jobs) {
    try {
      // Check for duplicates in database before inserting
      const existingJob = await prisma.job.findUnique({
        where: { id: j.id }
      })

      if (existingJob) {
        skipped++
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
      skipped++
    }
  }

  if (skipped > 0) {
    console.log(`Skipped ${skipped} duplicate/invalid jobs`)
  }

  return n
}
