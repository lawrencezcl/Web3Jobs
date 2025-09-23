'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type Job = {
  id: string
  title: string
  company: string
  location?: string | null
  country?: string | null
  remote: boolean
  tags?: string | null
  url: string
  source: string
  postedAt?: string | null
  createdAt: string
  salary?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  seniorityLevel?: string | null
}

type Filters = {
  countries: string[]
  seniorityLevels: string[]
  sources: string[]
  salaryRange: { min: number; max: number }
}

export default function EnhancedJobsPage() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [remote, setRemote] = useState('true')
  const [country, setCountry] = useState('')
  const [seniority, setSeniority] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [items, setItems] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    countries: [],
    seniorityLevels: [],
    sources: [],
    salaryRange: { min: 0, max: 500000 }
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  async function loadFilters() {
    try {
      const res = await fetch('/api/filters')
      const data = await res.json()
      setFilters(data)
    } catch (error) {
      console.error('Failed to load filters:', error)
    }
  }

  async function search() {
    setLoading(true)
    const params = new URLSearchParams({ 
      q, tag, remote, country, seniority,
      limit: '50', page: '1'
    })
    if (salaryMin) params.set('salaryMin', salaryMin)
    if (salaryMax) params.set('salaryMax', salaryMax)
    
    try {
      const res = await fetch('/api/jobs?' + params.toString())
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Search failed:', error)
      setItems([])
      setTotal(0)
    }
    setLoading(false)
  }

  const clearFilters = () => {
    setQ('')
    setTag('')
    setCountry('')
    setSeniority('')
    setSalaryMin('')
    setSalaryMax('')
    setRemote('true')
  }

  useEffect(() => { 
    loadFilters()
    search() 
  }, [])

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      return `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
    }
    if (job.salary) {
      return job.salary
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🌐 Web3 Remote Jobs</h1>
        <p className="text-slate-400">Auto-collected via Vercel Cron. {total} jobs found.</p>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Search title, company, tags..." 
              value={q} 
              onChange={e => setQ(e.target.value)}
              className="flex-1"
            />
            <Button onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          <div className="flex gap-2 items-center">
            <Button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm border border-slate-700"
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
            <Button onClick={clearFilters} className="text-sm border border-slate-700">
              Clear All
            </Button>
          </div>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tags</label>
                <Input 
                  placeholder="e.g. solidity" 
                  value={tag} 
                  onChange={e => setTag(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Location Type</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm"
                  value={remote} 
                  onChange={e => setRemote(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">Remote</option>
                  <option value="false">On-site/Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Country</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm"
                  value={country} 
                  onChange={e => setCountry(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {filters.countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Seniority</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm"
                  value={seniority} 
                  onChange={e => setSeniority(e.target.value)}
                >
                  <option value="">All Levels</option>
                  {filters.seniorityLevels.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Min Salary ($)</label>
                <Input 
                  type="number" 
                  placeholder="50000" 
                  value={salaryMin} 
                  onChange={e => setSalaryMin(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Max Salary ($)</label>
                <Input 
                  type="number" 
                  placeholder="200000" 
                  value={salaryMax} 
                  onChange={e => setSalaryMax(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Job Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(job => (
          <Card key={job.id} className="p-5 space-y-3 hover:border-slate-600 transition-colors">
            <div>
              <Link 
                href={`/jobs/${job.id}`} 
                className="text-lg font-semibold hover:text-blue-400 transition-colors block"
              >
                {job.title}
              </Link>
              <div className="text-slate-400 text-sm mt-1">
                {job.company} • {job.location || 'Remote'}
              </div>
            </div>

            {/* Salary */}
            {formatSalary(job) && (
              <div className="text-green-400 text-sm font-medium">
                {formatSalary(job)} {job.currency && job.currency !== 'USD' && `(${job.currency})`}
              </div>
            )}

            {/* Seniority */}
            {job.seniorityLevel && (
              <Badge className="text-xs bg-slate-700">
                {job.seniorityLevel}
              </Badge>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {(job.tags || '').split(',').filter(Boolean).slice(0, 4).map((t, i) => (
                <Badge key={i} className="text-xs border border-slate-600">
                  {t.trim()}
                </Badge>
              ))}
              <Badge className="text-xs">{job.source}</Badge>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">
                {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently posted'}
              </span>
              <a 
                href={job.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Apply →
              </a>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No jobs found matching your criteria.</p>
          <Button onClick={clearFilters} className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}

      <footer className="py-8 text-center text-slate-500 text-sm">
        Built with Next.js + Neon + Vercel Cron
      </footer>
    </div>
  )
}