// Monitoring and logging utilities
import { prisma } from '@/lib/db'

export interface CrawlLog {
  id: string
  startTime: Date
  endTime?: Date
  status: 'running' | 'success' | 'error'
  source: string
  jobsFound: number
  jobsInserted: number
  errors: string[]
  metadata?: any
}

export interface SystemMetrics {
  totalJobs: number
  jobsToday: number
  jobsThisWeek: number
  sourceBreakdown: Record<string, number>
  lastCrawlTime?: Date
  avgResponseTime: number
  errorRate: number
}

export class CrawlMonitor {
  private logs: Map<string, CrawlLog> = new Map()

  startCrawl(source: string): string {
    const id = `${source}-${Date.now()}`
    const log: CrawlLog = {
      id,
      source,
      startTime: new Date(),
      status: 'running',
      jobsFound: 0,
      jobsInserted: 0,
      errors: []
    }
    this.logs.set(id, log)
    console.log(`[Monitor] Starting crawl for ${source}`, { id, startTime: log.startTime })
    return id
  }

  logError(crawlId: string, error: Error, context?: any) {
    const log = this.logs.get(crawlId)
    if (log) {
      log.errors.push(`${error.message} - ${error.stack?.slice(0, 200)}`)
      if (context) {
        log.metadata = { ...log.metadata, error: context }
      }
      console.error(`[Monitor] Error in crawl ${crawlId}:`, error, context)
    }
  }

  updateProgress(crawlId: string, jobsFound: number, jobsInserted: number) {
    const log = this.logs.get(crawlId)
    if (log) {
      log.jobsFound = jobsFound
      log.jobsInserted = jobsInserted
      console.log(`[Monitor] Progress update ${crawlId}:`, { jobsFound, jobsInserted })
    }
  }

  finishCrawl(crawlId: string, success: boolean = true) {
    const log = this.logs.get(crawlId)
    if (log) {
      log.endTime = new Date()
      log.status = success ? 'success' : 'error'
      const duration = log.endTime.getTime() - log.startTime.getTime()
      
      console.log(`[Monitor] Crawl ${crawlId} finished:`, {
        source: log.source,
        status: log.status,
        duration: `${duration}ms`,
        jobsFound: log.jobsFound,
        jobsInserted: log.jobsInserted,
        errors: log.errors.length
      })

      // Store in database for long-term tracking
      this.persistLog(log).catch(console.error)
    }
  }

  private async persistLog(log: CrawlLog) {
    try {
      await prisma.crawlLog.create({
        data: {
          id: log.id,
          source: log.source,
          startTime: log.startTime,
          endTime: log.endTime || new Date(),
          status: log.status,
          jobsFound: log.jobsFound,
          jobsInserted: log.jobsInserted,
          errors: log.errors.join('\\n'),
          metadata: log.metadata ? JSON.stringify(log.metadata) : null
        }
      })
    } catch (error) {
      console.error('[Monitor] Failed to persist log:', error)
    }
  }

  getActiveCrawls(): CrawlLog[] {
    return Array.from(this.logs.values()).filter(log => log.status === 'running')
  }

  getCrawlSummary(): any {
    const logs = Array.from(this.logs.values())
    return {
      total: logs.length,
      running: logs.filter(l => l.status === 'running').length,
      success: logs.filter(l => l.status === 'success').length,
      errors: logs.filter(l => l.status === 'error').length,
      totalJobs: logs.reduce((sum, l) => sum + l.jobsInserted, 0)
    }
  }
}

export const crawlMonitor = new CrawlMonitor()

export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalJobs, jobsToday, jobsThisWeek, sourceStats, lastCrawl] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { createdAt: { gte: today } } }),
      prisma.job.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.job.groupBy({
        by: ['source'],
        _count: { id: true }
      }),
      prisma.crawlLog.findFirst({
        orderBy: { startTime: 'desc' },
        where: { status: 'success' }
      })
    ])

    const sourceBreakdown = sourceStats.reduce((acc, stat) => {
      acc[stat.source] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    // Calculate error rate from recent crawl logs
    const recentLogs = await prisma.crawlLog.findMany({
      where: { startTime: { gte: weekAgo } },
      select: { status: true, startTime: true, endTime: true }
    })

    const errorRate = recentLogs.length > 0 
      ? recentLogs.filter(l => l.status === 'error').length / recentLogs.length 
      : 0

    const avgResponseTime = recentLogs.length > 0
      ? recentLogs
          .filter(l => l.endTime)
          .reduce((sum, l) => sum + (l.endTime!.getTime() - l.startTime.getTime()), 0) / recentLogs.length
      : 0

    return {
      totalJobs,
      jobsToday,
      jobsThisWeek,
      sourceBreakdown,
      lastCrawlTime: lastCrawl?.startTime,
      avgResponseTime,
      errorRate
    }
  } catch (error) {
    console.error('Failed to get system metrics:', error)
    return {
      totalJobs: 0,
      jobsToday: 0,
      jobsThisWeek: 0,
      sourceBreakdown: {},
      avgResponseTime: 0,
      errorRate: 0
    }
  }
}

// Enhanced logging with structured data
export function logJobIngestion(source: string, jobCount: number, duration: number, errors: Error[] = []) {
  const logData = {
    timestamp: new Date().toISOString(),
    source,
    jobCount,
    duration,
    errors: errors.map(e => ({ message: e.message, stack: e.stack })),
    level: errors.length > 0 ? 'error' : 'info'
  }
  
  console.log(`[Ingestion] ${source}:`, logData)
}

export function logApiRequest(endpoint: string, params: any, responseTime: number, statusCode: number) {
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    params,
    responseTime,
    statusCode,
    level: statusCode >= 400 ? 'error' : 'info'
  }
  
  console.log(`[API] ${endpoint}:`, logData)
}