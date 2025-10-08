'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BookmarkButton, { CompactBookmarkButton } from '@/components/ui/bookmark-button'
import { useSavedJobs, type SavedJob } from '@/hooks/useSavedJobs'
import {
  Bookmark,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  ChevronDown
} from 'lucide-react'

export default function SavedJobsPage() {
  const {
    savedJobsData,
    savedJobsCount,
    isLoaded,
    clearSavedJobs,
    exportSavedJobs,
    importSavedJobs,
    checkJobStatus,
    getSavedJobsByCompany,
    getSavedJobsByTag,
    getRecentlySavedJobs
  } = useSavedJobs()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'savedAt' | 'postedAt' | 'company' | 'title'>('savedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusResults, setStatusResults] = useState<any>(null)
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)

  // Filter and sort jobs
  const filteredAndSortedJobs = savedJobsData
    .filter(job => {
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCompany = !selectedCompany ||
        job.company.toLowerCase() === selectedCompany.toLowerCase()

      const matchesTag = !selectedTag ||
        job.tags?.toLowerCase().includes(selectedTag.toLowerCase())

      return matchesSearch && matchesCompany && matchesTag
    })
    .sort((a, b) => {
      let comparison = 0

      if (sortBy === 'savedAt' || sortBy === 'postedAt') {
        const aTime = new Date(a[sortBy] || '').getTime()
        const bTime = new Date(b[sortBy] || '').getTime()
        comparison = aTime - bTime
      } else {
        let aValue = a[sortBy] || ''
        let bValue = b[sortBy] || ''

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue > bValue) {
          comparison = 1
        } else if (aValue < bValue) {
          comparison = -1
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Get unique companies for filter
  const uniqueCompanies = [...new Set(savedJobsData.map(job => job.company))].sort()

  // Get unique tags for filter
  const uniqueTags = [...new Set(
    savedJobsData.flatMap(job => job.tags?.split(',').filter(Boolean) || [])
  )].sort()

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importSavedJobs(file)
        .then(() => {
          alert('Jobs imported successfully!')
        })
        .catch((error) => {
          alert('Failed to import jobs: ' + error.message)
        })
    }
  }

  const handleCheckStatus = async () => {
    setCheckingStatus(true)
    try {
      const results = await checkJobStatus()
      setStatusResults(results)
    } catch (error) {
      console.error('Failed to check job status:', error)
      alert('Failed to check job status')
    } finally {
      setCheckingStatus(false)
    }
  }

  const formatSalary = (salary?: string | null) => {
    if (!salary) return 'Salary not specified'
    return salary
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-400">Loading saved jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Bookmark className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold">Saved Jobs</h1>
              <p className="text-slate-400">
                {savedJobsCount} {savedJobsCount === 1 ? 'job' : 'jobs'} saved
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {savedJobsCount > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCheckStatus}
                  disabled={checkingStatus}
                  className="text-sm"
                >
                  {checkingStatus ? 'Checking...' : 'Check Status'}
                </Button>

                <Button
                  variant="outline"
                  onClick={exportSavedJobs}
                  className="text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef?.click()}
                  className="text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>

                <Button
                  variant="outline"
                  onClick={clearSavedJobs}
                  className="text-sm text-red-600 hover:text-red-700 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={setFileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {savedJobsCount === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No saved jobs yet</h2>
          <p className="text-slate-400 mb-6">
            Start saving jobs you're interested in and they'll appear here
          </p>
          <a href="/jobs" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2">
            Browse Jobs
          </a>
        </Card>
      ) : (
        <>
          {/* Status Results */}
          {statusResults && (
            <Card className="p-4 mb-6 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm">
                  {statusResults.activeJobs} of {statusResults.totalJobs} jobs are still active
                </span>
                {statusResults.inactiveJobs > 0 && (
                  <span className="text-sm text-amber-400">
                    ({statusResults.inactiveJobs} may be expired)
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Search and Filters */}
          <Card className="p-4 mb-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search saved jobs by title, company, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company
                    </label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                    >
                      <option value="">All Companies</option>
                      {uniqueCompanies.map(company => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tag
                    </label>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                    >
                      <option value="">All Tags</option>
                      {uniqueTags.map(tag => (
                        <option key={tag} value={tag}>
                          {tag.trim()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-')
                        setSortBy(field as any)
                        setSortOrder(order as any)
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                    >
                      <option value="savedAt-desc">Saved Recently</option>
                      <option value="savedAt-asc">Saved Long Ago</option>
                      <option value="postedAt-desc">Posted Recently</option>
                      <option value="postedAt-asc">Posted Long Ago</option>
                      <option value="company-asc">Company (A-Z)</option>
                      <option value="company-desc">Company (Z-A)</option>
                      <option value="title-asc">Title (A-Z)</option>
                      <option value="title-desc">Title (Z-A)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {(searchQuery || selectedCompany || selectedTag) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {searchQuery && (
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">
                      Search: {searchQuery}
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCompany && (
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">
                      Company: {selectedCompany}
                      <button
                        onClick={() => setSelectedCompany('')}
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">
                      Tag: {selectedTag}
                      <button
                        onClick={() => setSelectedTag('')}
                        className="ml-1 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-slate-400">
              Showing {filteredAndSortedJobs.length} of {savedJobsCount} saved jobs
            </div>
            <div className="text-sm text-slate-500">
              Sorted by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()} ({sortOrder})
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                        {job.title}
                      </a>
                    </h3>
                    <div className="font-medium text-slate-300 mb-1">{job.company}</div>
                    <div className="text-xs text-slate-500">
                      Saved {formatDate(job.savedAt)}
                      {job.postedAt && ` • Posted ${formatDate(job.postedAt)}`}
                    </div>
                  </div>
                  <CompactBookmarkButton job={job} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.remote ? 'Remote' : job.location || 'On-site'}
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatSalary(job.salary)}
                      </div>
                    )}
                  </div>

                  {job.tags && (
                    <div className="flex flex-wrap gap-1">
                      {job.tags.split(',').filter(Boolean).slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-slate-700 border-slate-600 px-2 py-1 rounded-md">
                          {tag.trim()}
                        </span>
                      ))}
                      {job.tags.split(',').filter(Boolean).length > 3 && (
                        <span className="text-xs bg-slate-600 border-slate-500 px-2 py-1 rounded-md">
                          +{job.tags.split(',').filter(Boolean).length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <a
                      href={`/jobs/${job.id}`}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Details
                    </a>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
                    >
                      Apply
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State for Filtered Results */}
          {filteredAndSortedJobs.length === 0 && (
            <Card className="p-12 text-center">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No jobs match your filters</h3>
              <p className="text-slate-400 mb-4">
                Try adjusting your search criteria or clear all filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCompany('')
                  setSelectedTag('')
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </>
      )}
    </div>
  )
}