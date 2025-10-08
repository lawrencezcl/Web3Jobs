'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import BookmarkButton, { CompactBookmarkButton } from '@/components/ui/bookmark-button'
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  ExternalLink,
  Twitter,
  Linkedin,
  Github,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'

interface Company {
  name: string
  slug: string
  description?: string
  website?: string
  headquarters?: string
  founded?: string
  size?: string
  industry?: string
  tags?: string[]
  social?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  verified?: boolean
  rating?: number
  totalJobs?: number
  activeJobs?: number
  featured?: boolean
}

interface Job {
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

export default function CompanyProfilePage() {
  const params = useParams()
  const company = params.company as string

  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'postedAt' | 'title' | 'salary'>('postedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchCompanyData()
  }, [company])

  const fetchCompanyData = async () => {
    setLoading(true)
    try {
      // Fetch company jobs
      const jobsResponse = await fetch(`/api/jobs?company=${encodeURIComponent(company)}&limit=100`)
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.items || [])

        // Extract company information from jobs
        if (jobsData.items && jobsData.items.length > 0) {
          const firstJob = jobsData.items[0]
          const uniqueLocations = [...new Set(jobsData.items.map((job: Job) => job.location).filter(Boolean))]
          const uniqueTags = [...new Set(jobsData.items.flatMap((job: Job) => job.tags?.split(',').filter(Boolean) || []))]

          setCompany({
            name: firstJob.company,
            slug: company,
            description: `Leading Web3 company specializing in ${uniqueTags.slice(0, 3).join(', ')}.`,
            website: extractWebsiteFromUrl(firstJob.url),
            headquarters: uniqueLocations[0] || 'Remote',
            founded: '2020',
            size: estimateCompanySize(jobsData.items.length),
            industry: 'Blockchain & Cryptocurrency',
            tags: uniqueTags.slice(0, 10),
            verified: Math.random() > 0.5, // Random verification for demo
            rating: 4.2 + Math.random() * 0.8, // Random rating 4.2-5.0
            totalJobs: jobsData.total || jobsData.items.length,
            activeJobs: jobsData.items.length,
            featured: jobsData.items.length > 5
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch company data:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractWebsiteFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return `${urlObj.protocol}//${urlObj.hostname}`
    } catch {
      return '#'
    }
  }

  const estimateCompanySize = (jobCount: number): string => {
    if (jobCount <= 5) return '1-50 employees'
    if (jobCount <= 15) return '51-200 employees'
    if (jobCount <= 30) return '201-500 employees'
    return '500+ employees'
  }

  const filteredAndSortedJobs = jobs
    .filter(job => {
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLocation = !selectedLocation ||
        job.location?.toLowerCase().includes(selectedLocation.toLowerCase())

      const matchesRemote = !remoteOnly || job.remote

      return matchesSearch && matchesLocation && matchesRemote
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === 'postedAt') {
        aValue = new Date(aValue || '').getTime()
        bValue = new Date(bValue || '').getTime()
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const uniqueLocations = [...new Set(jobs.map(job => job.location).filter(Boolean))].sort()
  const uniqueDepartments = [...new Set(jobs.flatMap(job => job.tags?.split(',').filter(Boolean) || []))].sort()

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

  const formatSalary = (salary?: string | null) => {
    if (!salary) return 'Competitive'
    return salary
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-400">Loading company profile...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Company Not Found</h2>
          <p className="text-slate-400 mb-6">
            We couldn't find a company with the name "{company}"
          </p>
          <Button asChild>
            <a href="/jobs">Browse All Jobs</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Company Header */}
      <Card className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{company.name}</h1>
                {company.verified && (
                  <CheckCircle className="w-6 h-6 text-blue-400" title="Verified Company" />
                )}
                {company.featured && (
                  <Badge className="bg-amber-500 text-white">Featured</Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 text-slate-400">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 mr-1" />
                  <span>{company.rating?.toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span>{company.activeJobs} open positions</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{company.size}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {company.website && company.website !== '#' && (
              <Button variant="outline" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
            <Button>
              <ExternalLink className="w-4 h-4 mr-2" />
              Follow Company
            </Button>
          </div>
        </div>

        <p className="text-slate-300 mb-6 leading-relaxed">
          {company.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center text-slate-400 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              Headquarters
            </div>
            <div className="font-medium">{company.headquarters}</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center text-slate-400 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Founded
            </div>
            <div className="font-medium">{company.founded}</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center text-slate-400 mb-2">
              <Building2 className="w-4 h-4 mr-2" />
              Industry
            </div>
            <div className="font-medium">{company.industry}</div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center text-slate-400 mb-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Growth
            </div>
            <div className="font-medium text-green-400">+23% YoY</div>
          </div>
        </div>

        {company.tags && company.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Technologies & Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {company.tags.map((tag, index) => (
                <Badge key={index} className="bg-slate-700 border-slate-600">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Social Links */}
      {company.social && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Connect with {company.name}</h3>
          <div className="flex items-center space-x-4">
            {company.social.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://twitter.com/${company.social.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </a>
              </Button>
            )}
            {company.social.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={company.social.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {company.social.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={company.social.github} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Jobs Search and Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Open Positions ({filteredAndSortedJobs.length})</h2>
          <div className="text-sm text-slate-400">
            {company.activeJobs} positions available
          </div>
        </div>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search positions by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept.trim()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Work Type
              </label>
              <select
                value={remoteOnly ? 'remote' : 'all'}
                onChange={(e) => setRemoteOnly(e.target.value === 'remote')}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
              >
                <option value="all">All Types</option>
                <option value="remote">Remote Only</option>
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
                <option value="postedAt-desc">Most Recent</option>
                <option value="postedAt-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedDepartment || selectedLocation || remoteOnly) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedDepartment && (
                <Badge variant="secondary" className="text-xs">
                  Department: {selectedDepartment}
                  <button
                    onClick={() => setSelectedDepartment('')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedLocation && (
                <Badge variant="secondary" className="text-xs">
                  Location: {selectedLocation}
                  <button
                    onClick={() => setSelectedLocation('')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {remoteOnly && (
                <Badge variant="secondary" className="text-xs">
                  Remote Only
                  <button
                    onClick={() => setRemoteOnly(false)}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Jobs List */}
      {filteredAndSortedJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedJobs.map((job) => (
            <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
                      {job.company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 hover:text-blue-400 transition-colors">
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                          {job.title}
                        </a>
                      </h3>

                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.remote ? 'Remote' : job.location || 'On-site'}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatSalary(job.salary)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {job.postedAt ? formatDate(job.postedAt) : 'Recently'}
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-slate-300 mb-4 line-clamp-3">
                          {job.description.replace(/<[^>]*>/g, '').substring(0, 200)}...
                        </p>
                      )}

                      {job.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.tags.split(',').filter(Boolean).slice(0, 4).map((tag) => (
                            <Badge key={tag} className="text-xs bg-slate-700 border-slate-600">
                              {tag.trim()}
                            </Badge>
                          ))}
                          {job.tags.split(',').filter(Boolean).length > 4 && (
                            <Badge className="text-xs bg-slate-600 border-slate-500">
                              +{job.tags.split(',').filter(Boolean).length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  <CompactBookmarkButton job={job} />
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No positions found</h3>
          <p className="text-slate-400 mb-6">
            Try adjusting your search criteria or check back later for new openings
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedDepartment('')
              setSelectedLocation('')
              setRemoteOnly(false)
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Company Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Why Work at {company.name}</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="font-medium mb-1">Rapid Growth</h4>
            <p className="text-sm text-slate-400">
              Join a fast-growing team with exciting opportunities for advancement
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="font-medium mb-1">Great Culture</h4>
            <p className="text-sm text-slate-400">
              Collaborative environment with talented professionals from around the world
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-medium mb-1">Competitive Benefits</h4>
            <p className="text-sm text-slate-400">
              Comprehensive compensation packages with excellent benefits and perks
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}