'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import Link from 'next/link'

type Job = {
  id: string
  title: string
  company: string
  location?: string | null
  remote: boolean
  tags?: string | null
  url: string
  source: string
  postedAt?: string | null
  createdAt: string
  salary?: string | null
  seniorityLevel?: string | null
  description?: string | null
}

type JobsPageProps = {
  // mockMode removed - always using live data
}

export default function EnhancedJobsPage() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [remote, setRemote] = useState('true')
  const [items, setItems] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ q, tag, remote, limit: '50', page: '1' })

    try {
      const res = await fetch('/api/jobs?' + params.toString(), {
        cache: 'no-store',
        headers: { 'pragma': 'no-cache', 'cache-control': 'no-cache' }
      })

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [q, tag, remote])

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(search, 300)
    }
  }, [search])

  useEffect(() => { search() }, [])


  const formatSalary = useCallback((job: Job) => {
    if (job.salary) return job.salary
    return 'Salary not specified'
  }, [])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }, [])

  const JobCard = useMemo(() => ({ job }: { job: Job }) => (
    <Card className="p-4 space-y-3 bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 transition-colors">
      <div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-lg font-semibold hover:text-blue-400 transition-colors block leading-tight"
        >
          {job.title}
        </Link>
        <div className="text-slate-400 mt-1">
          <span className="font-medium">{job.company}</span>
          {job.location && <span> • {job.location}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-green-400 font-medium">{formatSalary(job)}</span>
        </div>

        <div className="flex gap-2">
          <Badge className={job.remote ? 'bg-green-800 border-green-600 text-green-200' : 'bg-orange-800 border-orange-600 text-orange-200'}>
            {job.remote ? '🌍 Remote' : '🏢 Onsite'}
          </Badge>
          {job.seniorityLevel && (
            <Badge className="bg-purple-800 border-purple-600 text-purple-200">{job.seniorityLevel}</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {(job.tags || '').split(',').filter(Boolean).slice(0,4).map(t => (
            <Badge key={t} className="text-xs bg-slate-700 border-slate-600">
              {t.trim()}
            </Badge>
          ))}
          <Badge className="text-xs bg-blue-800 border-blue-600 text-blue-200">
            {job.source}
          </Badge>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          {job.postedAt ? formatDate(job.postedAt) : 'Recently posted'}
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Apply →
        </a>
      </div>
    </Card>
  ), [formatSalary, formatDate])

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">🌐 Web3 Remote Jobs</h1>
          <p className="text-slate-400">Auto-collected via Vercel Cron. Search below.</p>
        </div>
      </div>


      {/* Search Controls */}
      <div className="bg-slate-900/50 rounded-lg p-4 mb-6 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Search title/company/tags..."
            value={q}
            onChange={e => {
              setQ(e.target.value)
              debouncedSearch()
            }}
            className="flex-1 min-w-[200px]"
          />
          <Input
            placeholder="Tag (e.g. solidity)"
            value={tag}
            onChange={e => {
              setTag(e.target.value)
              debouncedSearch()
            }}
            className="flex-1 min-w-[150px]"
          />
          <select
            className="bg-slate-800 border border-slate-700 rounded-md px-3 py-2"
            value={remote}
            onChange={e => {
              setRemote(e.target.value)
              debouncedSearch()
            }}
          >
            <option value="true">Remote Only</option>
            <option value="false">Onsite/Hybrid</option>
          </select>
          <Button
            onClick={debouncedSearch}
            disabled={loading}
            className="px-6"
          >
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-slate-400">
          Found <span className="text-white font-semibold">{total}</span> jobs
        </div>
        <div className="text-sm text-slate-500">
          Live data
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-400">Loading jobs...</p>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
          <p className="text-slate-400 mb-4">
            Try adjusting your search criteria or clear your filters
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 border-t border-slate-800 mt-8">
        <p>Built with Next.js + Neon + Vercel Cron</p>
        <p className="text-sm mt-1">
          Connected to live database
        </p>
      </footer>
    </div>
  )
}