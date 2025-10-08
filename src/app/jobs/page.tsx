'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import Link from 'next/link'
import Breadcrumb from '../../components/breadcrumb'
import AdvancedFilters from '../../components/ui/advanced-filters'
import SearchSuggestions from '../../components/ui/search-suggestions'
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  ExternalLink
} from 'lucide-react'

type Job = {
  id: string
  title: string
  company: string
  location?: string | null
  remote: boolean
  tags?: string | null
  url: string
  source: string
  postedAt?: Date | null
  createdAt: Date
  salary?: string | null
  seniorityLevel?: string | null
  employmentType?: string | null
}

interface AdvancedFilters {
  salaryMin?: string
  salaryMax?: string
  experienceLevel?: string
  companySize?: string
  jobType?: string
  region?: string
  timezone?: string
}

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || searchParams.get('q') || '')
  const [tag, setTag] = useState(searchParams.get('tags') || searchParams.get('tag') || '')
  const [remote, setRemote] = useState(searchParams.get('remote') || 'true')
  const [source, setSource] = useState(searchParams.get('companies') || searchParams.get('source') || '')
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    companySize: '',
    jobType: '',
    region: '',
    timezone: ''
  })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (searchQuery) params.set('query', searchQuery)
      if (tag) params.set('tags', tag)
      if (remote) params.set('remote', remote)
      if (source) params.set('companies', source)
      params.set('page', currentPage.toString())

      // Add advanced filters
      Object.entries(advancedFilters).forEach(([key, value]) => {
        if (value) {
          if (key === 'salaryMin' || key === 'salaryMax') {
            params.set(key, value)
          } else if (key === 'experienceLevel') {
            params.set('experienceLevel', value)
          } else if (key === 'jobType') {
            params.set('employmentType', value)
          } else if (key === 'region') {
            params.set('locations', value)
          } else {
            params.set(key, value)
          }
        }
      })

      const response = await fetch(`/api/jobs/enhanced?${params}`)
      if (!response.ok) throw new Error('Failed to fetch jobs')

      const data = await response.json()
      setJobs(data.jobs || [])
      setTotal(data.pagination?.total || 0)
      setTotalPages(data.pagination?.pages || 0)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, tag, remote, source, currentPage, advancedFilters])

  const updateURL = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('query', searchQuery)
    if (tag) params.set('tags', tag)
    if (remote) params.set('remote', remote)
    if (source) params.set('companies', source)
    if (currentPage > 1) params.set('page', currentPage.toString())

    // Add advanced filters to URL for bookmarking
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'salaryMin' || key === 'salaryMax') {
          params.set(key, value)
        } else if (key === 'experienceLevel') {
          params.set('experienceLevel', value)
        } else if (key === 'jobType') {
          params.set('employmentType', value)
        } else if (key === 'region') {
          params.set('locations', value)
        } else {
          params.set(key, value)
        }
      }
    })

    const newURL = `/jobs${params.toString() ? '?' + params.toString() : ''}`
    router.push(newURL, { scroll: false })
  }

  useEffect(() => {
    updateURL()
  }, [searchQuery, tag, remote, source, currentPage, advancedFilters])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setTag('')
    setRemote('true')
    setSource('')
    setAdvancedFilters({
      salaryMin: '',
      salaryMax: '',
      experienceLevel: '',
      companySize: '',
      jobType: '',
      region: '',
      timezone: ''
    })
    setCurrentPage(1)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Recently'
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    return `${Math.floor(diffInDays / 30)}mo ago`
  }

  const formatSalary = (job: Job) => {
    if (job.salary) return job.salary
    return 'Competitive'
  }

  const activeFiltersCount = [
    searchQuery,
    tag,
    remote !== 'true' ? remote : '',
    source,
    ...Object.values(advancedFilters).filter(v => v !== '')
  ].filter(Boolean).length

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto p-6">
          <Breadcrumb items={[{ label: 'Jobs' }]} />
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-slate-400">Loading jobs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Jobs' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            All Web3 Jobs
            {searchQuery && <span className="text-blue-400"> for "{searchQuery}"</span>}
            {tag && <span className="text-purple-400"> in {tag}</span>}
          </h1>
          <p className="text-slate-400 text-lg">
            Discover {total.toLocaleString()} opportunities in blockchain, DeFi, and Web3
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
          <div className="space-y-6">
            {/* Search Bar with Suggestions */}
            <div className="md:col-span-2">
              <SearchSuggestions
                onSearch={handleSearch}
                placeholder="Search jobs, companies, or skills..."
                className="mb-4"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Skills (e.g. Solidity)"
                  value={tag}
                  onChange={(e) => {
                    setTag(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>

              <div>
                <select
                  value={remote}
                  onChange={(e) => {
                    setRemote(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
                >
                  <option value="true">🌍 Remote Only</option>
                  <option value="false">🏢 On-site/Hybrid</option>
                  <option value="">📍 All Locations</option>
                </select>
              </div>

              <div>
                <Input
                  placeholder="Source (e.g. Wellfound)"
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters
              onFiltersChange={(filters) => {
                setAdvancedFilters(filters)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        {/* Job Results */}
        {jobs.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-slate-400 text-sm">
                Showing {jobs.length} of {total.toLocaleString()} opportunities
              </div>
              <div className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            <div className="grid gap-6 mb-8">
              {jobs.map((job) => (
                <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link href={`/jobs/${job.id}`} className="block">
                            <h2 className="text-xl font-semibold hover:text-blue-400 transition-colors mb-2">
                              {job.title}
                            </h2>
                          </Link>
                          <div className="flex items-center space-x-4 text-slate-400 mb-3">
                            <span className="font-medium text-slate-300">{job.company}</span>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.remote ? 'Remote' : job.location || 'On-site'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(job.postedAt || null)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-slate-700 border-slate-600">
                            {job.source}
                          </Badge>
                          {job.seniorityLevel && (
                            <Badge className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/20">
                              {job.seniorityLevel}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {job.tags && job.tags.split(',').filter(Boolean).slice(0, 4).map((tag, index) => (
                            <Badge key={index} className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/20">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-sm text-slate-400">
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            {formatSalary(job)}
                          </div>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                          >
                            Apply
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-600"
                >
                  Previous
                </Button>

                <span className="text-slate-400 px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-slate-600"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search criteria or explore our trending categories
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}