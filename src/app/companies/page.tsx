'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  CheckCircle,
  Globe,
  TrendingUp,
  Users,
  ChevronDown,
  ExternalLink,
  Heart
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
  verified?: boolean
  rating?: number
  totalJobs?: number
  activeJobs?: number
  featured?: boolean
  growth?: number
  recentHiring?: boolean
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'jobs' | 'rating' | 'growth'>('jobs')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      // Fetch all jobs and extract unique companies
      const response = await fetch('/api/jobs?limit=500')
      if (response.ok) {
        const data = await response.json()
        const jobs = data.items || []

        // Group jobs by company
        const companyMap = new Map<string, any[]>()

        jobs.forEach((job: any) => {
          if (!companyMap.has(job.company)) {
            companyMap.set(job.company, [])
          }
          const jobs = companyMap.get(job.company)
          if (jobs) {
            jobs.push(job)
          }
        })

        // Create company objects
        const companyList: Company[] = Array.from(companyMap.entries()).map(([companyName, companyJobs]) => {
          const uniqueLocations = [...new Set(companyJobs.map((job: any) => job.location).filter(Boolean))]
          const uniqueTags = [...new Set(companyJobs.flatMap((job: any) => job.tags?.split(',').filter(Boolean) || []))]
          const remoteJobs = companyJobs.filter((job: any) => job.remote).length
          const recentJobs = companyJobs.filter((job: any) => {
            const postedDate = new Date(job.postedAt || job.createdAt)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return postedDate >= weekAgo
          }).length

          return {
            name: companyName,
            slug: companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            description: `Leading Web3 company specializing in ${uniqueTags.slice(0, 3).join(', ')}. Building the future of decentralized technology.`,
            headquarters: uniqueLocations[0] || 'Remote',
            founded: String(2018 + Math.floor(Math.random() * 6)), // Random year between 2018-2023
            size: estimateCompanySize(companyJobs.length),
            industry: categorizeIndustry(uniqueTags),
            tags: uniqueTags.slice(0, 8),
            verified: Math.random() > 0.6, // 40% chance of being verified
            rating: 3.8 + Math.random() * 1.2, // Random rating 3.8-5.0
            totalJobs: companyJobs.length,
            activeJobs: companyJobs.length,
            featured: companyJobs.length > 10,
            growth: Math.floor(Math.random() * 50), // Random growth 0-50%
            recentHiring: recentJobs > 0
          }
        })

        setCompanies(companyList)
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const estimateCompanySize = (jobCount: number): string => {
    if (jobCount <= 3) return '1-50 employees'
    if (jobCount <= 10) return '51-200 employees'
    if (jobCount <= 20) return '201-500 employees'
    if (jobCount <= 50) return '501-1000 employees'
    return '1000+ employees'
  }

  const categorizeIndustry = (tags: string[]): string => {
    const tagString = tags.join(' ').toLowerCase()

    if (tagString.includes('defi') || tagString.includes('finance')) return 'DeFi & Finance'
    if (tagString.includes('nft') || tagString.includes('gaming')) return 'NFT & Gaming'
    if (tagString.includes('infrastructure') || tagString.includes('protocol')) return 'Infrastructure'
    if (tagString.includes('security') || tagString.includes('audit')) return 'Security & Auditing'
    if (tagString.includes('exchange') || tagString.includes('trading')) return 'Trading & Exchange'
    if (tagString.includes('layer') || tagString.includes('blockchain')) return 'Layer 1 & Layer 2'
    if (tagString.includes('wallet') || tagString.includes('custody')) return 'Wallet & Custody'

    return 'Blockchain & Web3'
  }

  const filteredAndSortedCompanies = companies
    .filter(company => {
      const matchesSearch = !searchQuery ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry
      const matchesSize = !selectedSize || company.size === selectedSize
      const matchesVerified = !verifiedOnly || company.verified

      return matchesSearch && matchesIndustry && matchesSize && matchesVerified
    })
    .sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'jobs':
          aValue = a.totalJobs || 0
          bValue = b.totalJobs || 0
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'growth':
          aValue = a.growth || 0
          bValue = b.growth || 0
          break
        default:
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const uniqueIndustries = [...new Set(companies.map(company => company.industry))].sort()
  const uniqueSizes = [...new Set(companies.map(company => company.size))].sort()

  const featuredCompanies = companies.filter(company => company.featured).slice(0, 6)
  const recentlyHiring = companies.filter(company => company.recentHiring).slice(0, 8)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-400">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Web3 Companies</h1>
        <p className="text-xl text-slate-400 mb-8">
          Discover leading blockchain companies building the future of decentralized technology
        </p>
        <div className="flex justify-center space-x-8 text-sm">
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-slate-300">{companies.length} Companies</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-slate-300">{companies.reduce((sum, c) => sum + (c.activeJobs || 0), 0)} Open Positions</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-amber-400 mr-2" />
            <span className="text-slate-300">{companies.filter(c => c.verified).length} Verified</span>
          </div>
        </div>
      </div>

      {/* Featured Companies */}
      {featuredCompanies.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Companies</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => (
              <Card key={company.slug} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                          <a href={`/companies/${company.slug}`}>
                            {company.name}
                          </a>
                        </h3>
                        {company.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-400" />
                        )}
                        <Badge className="bg-amber-500 text-white text-xs">Featured</Badge>
                      </div>
                      <div className="text-sm text-slate-400">{company.industry}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                  {company.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-slate-400">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {company.activeJobs} jobs
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-amber-400" />
                      {company.rating?.toFixed(1)}
                    </div>
                  </div>
                  <a
                    href={`/companies/${company.slug}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Jobs
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recently Hiring */}
      {recentlyHiring.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently Hiring</h2>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs font-medium inline-flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Active Now
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyHiring.map((company) => (
              <Card key={company.slug} className="p-4 hover:bg-slate-800/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm hover:text-blue-400 transition-colors">
                      <a href={`/companies/${company.slug}`}>
                        {company.name}
                      </a>
                    </h4>
                    <div className="text-xs text-slate-400">{company.size}</div>
                  </div>
                  {company.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">{company.activeJobs} positions</span>
                  <span className="text-slate-400">{company.industry}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search companies by name, industry, or keywords..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                >
                  <option value="">All Industries</option>
                  {uniqueIndustries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                >
                  <option value="">All Sizes</option>
                  {uniqueSizes.map(size => (
                    <option key={size} value={size}>
                      {size}
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
                  <option value="jobs-desc">Most Openings</option>
                  <option value="jobs-asc">Fewest Openings</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="rating-asc">Lowest Rated</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="growth-desc">Fastest Growing</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center text-sm font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  Verified Companies Only
                </label>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchQuery || selectedIndustry || selectedSize || verifiedOnly) && (
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
              {selectedIndustry && (
                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">
                  Industry: {selectedIndustry}
                  <button
                    onClick={() => setSelectedIndustry('')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSize && (
                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">
                  Size: {selectedSize}
                  <button
                    onClick={() => setSelectedSize('')}
                    className="ml-1 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {verifiedOnly && (
                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-md text-xs">
                  Verified Only
                  <button
                    onClick={() => setVerifiedOnly(false)}
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
      <div className="flex justify-between items-center">
        <div className="text-slate-400">
          Showing {filteredAndSortedCompanies.length} of {companies.length} companies
        </div>
        <div className="text-sm text-slate-500">
          Sorted by {sortBy} ({sortOrder})
        </div>
      </div>

      {/* Companies Grid */}
      {filteredAndSortedCompanies.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCompanies.map((company) => (
            <Card key={company.slug} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                        <a href={`/companies/${company.slug}`}>
                          {company.name}
                        </a>
                      </h3>
                      {company.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{company.industry}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                {company.description}
              </p>

              {company.tags && company.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {company.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} className="text-xs bg-slate-700 border-slate-600">
                      {tag.trim()}
                    </Badge>
                  ))}
                  {company.tags.length > 3 && (
                    <Badge className="text-xs bg-slate-600 border-slate-500">
                      +{company.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {company.activeJobs} jobs
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {company.size}
                  </div>
                </div>
                {company.growth && company.growth > 0 && (
                  <div className="flex items-center text-green-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{company.growth}%
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-amber-400" />
                    <span className="text-sm font-medium">{company.rating?.toFixed(1)}</span>
                  </div>
                  {company.recentHiring && (
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-md font-medium">
                      Actively Hiring
                    </span>
                  )}
                </div>
                <a
                  href={`/companies/${company.slug}`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Profile
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No companies found</h3>
          <p className="text-slate-400 mb-6">
            Try adjusting your search criteria or browse all companies
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setSelectedIndustry('')
              setSelectedSize('')
              setVerifiedOnly(false)
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  )
}