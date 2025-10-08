'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import NewsletterSignup from './ui/newsletter-signup'
import BookmarkButton, { CompactBookmarkButton } from './ui/bookmark-button'
import AdvancedFilters from './ui/advanced-filters'
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Building,
  Bookmark
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
  postedAt?: string | null
  createdAt: string
  salary?: string | null
  seniorityLevel?: string | null
  description?: string | null
}

type InitialData = {
  featuredJobs: Job[]
  totalCount: number
}

type ModernHomepageProps = {
  initialData?: InitialData
}

const TRENDING_KEYWORDS = [
  'Solidity', 'DeFi', 'Smart Contracts', 'Ethereum', 'Blockchain', 
  'Web3', 'NFT', 'DAO', 'Layer 2', 'Rust'
]

const POPULAR_COMPANIES = [
  { name: 'Coinbase', logo: '🔵', jobs: 45 },
  { name: 'Uniswap', logo: '🦄', jobs: 23 },
  { name: 'Aave', logo: '👻', jobs: 18 },
  { name: 'Chainlink', logo: '🔗', jobs: 31 },
  { name: 'Polygon', logo: '🟣', jobs: 27 },
  { name: 'OpenSea', logo: '🌊', jobs: 19 }
]

export default function ModernHomepage({ initialData }: ModernHomepageProps) {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [remote, setRemote] = useState('true')
  const [dateRange, setDateRange] = useState('')
  const [items, setItems] = useState<Job[]>([])
  const [total, setTotal] = useState(initialData?.totalCount || 0)
  const [loading, setLoading] = useState(false)
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>(initialData?.featuredJobs || [])
  const [advancedFilters, setAdvancedFilters] = useState({
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    companySize: '',
    jobType: '',
    region: '',
    timezone: ''
  })

  const search = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ q, tag, remote, limit: '12', page: '1' })
    if (dateRange) params.append('dateRange', dateRange)

    // Add advanced filters
    if (advancedFilters.salaryMin) params.append('salaryMin', advancedFilters.salaryMin)
    if (advancedFilters.salaryMax) params.append('salaryMax', advancedFilters.salaryMax)
    if (advancedFilters.experienceLevel) params.append('experienceLevel', advancedFilters.experienceLevel)
    if (advancedFilters.companySize) params.append('companySize', advancedFilters.companySize)
    if (advancedFilters.jobType) params.append('jobType', advancedFilters.jobType)
    if (advancedFilters.region) params.append('region', advancedFilters.region)
    if (advancedFilters.timezone) params.append('timezone', advancedFilters.timezone)

    try {
      const res = await fetch('/api/jobs?' + params.toString(), {
        cache: 'default', // Allow browser caching
        headers: { 
          'Cache-Control': 'public, max-age=60' // 1 minute cache
        }
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
  }, [q, tag, remote, dateRange, advancedFilters])

  const loadFeaturedJobs = useCallback(async () => {
    // Only fetch if we don't have initial data
    if (!initialData?.featuredJobs?.length) {
      try {
        const res = await fetch('/api/jobs?limit=6&featured=true', { 
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes cache
        })
        const data = await res.json()
        setFeaturedJobs(data.items || [])
      } catch (error) {
        console.error('Failed to fetch featured jobs:', error)
      }
    }
  }, [initialData])

  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(search, 300)
    }
  }, [search])

  useEffect(() => { 
    // Only perform initial search, don't load featured jobs if we have initial data
    search()
    if (!initialData?.featuredJobs?.length) {
      loadFeaturedJobs()
    }
  }, [])

  const formatSalary = useCallback((job: Job) => {
    if (job.salary) return job.salary
    return 'Competitive'
  }, [])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    return `${Math.floor(diffInDays / 30)}mo ago`
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm text-blue-300">Live Jobs Updated Daily</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight">
            Your Web3 Career
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Starts Here
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover remote opportunities at leading Web3 companies. From DeFi protocols to NFT platforms, 
            find your perfect blockchain career today.
          </p>

          {/* Hero Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search Web3 jobs (e.g., Solidity Developer, DeFi Analyst...)"
                value={q}
                onChange={e => setQ(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10 transition-all duration-300"
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <Button 
                onClick={search}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Trending Keywords */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <span className="text-sm text-slate-400 mr-2">Trending:</span>
            {TRENDING_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => {
                  setQ(keyword)
                  search()
                }}
                className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-200 hover:scale-105"
              >
                {keyword}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{total.toLocaleString()}+</div>
              <div className="text-slate-400">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">85%</div>
              <div className="text-slate-400">Remote</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">150+</div>
              <div className="text-slate-400">New Weekly</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Companies */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Top Web3 Companies Hiring</h2>
            <p className="text-slate-400">Join the teams building the future of finance</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_COMPANIES.map((company) => (
              <Card key={company.name} className="p-4 text-center hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group">
                <Link href={`/jobs?q=${encodeURIComponent(company.name)}`} className="block">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {company.logo}
                  </div>
                  <div className="font-medium text-sm">{company.name}</div>
                  <div className="text-xs text-slate-400">{company.jobs} jobs</div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="py-16 px-4 bg-slate-900/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Opportunities</h2>
                <p className="text-slate-400">Handpicked roles from top Web3 companies</p>
              </div>
              <Link href="/jobs">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  View All Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.slice(0, 6).map((job) => (
                <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-300">{job.company}</div>
                        <div className="text-sm text-slate-500">{job.postedAt ? formatDate(job.postedAt) : 'Recently'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookmarkButton job={job} size="sm" />
                      <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  
                  <Link href={`/jobs/${job.id}`} className="block">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.remote ? 'Remote' : job.location || 'On-site'}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(job)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.tags || '').split(',').filter(Boolean).slice(0, 3).map((tag) => (
                      <Badge key={tag} className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/20">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                  
                  <Link 
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Advanced Search & Results */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
            <AdvancedFilters
              onFiltersChange={setAdvancedFilters}
              className="mb-6"
            />
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Job title, company, or keyword..."
                  value={q}
                  onChange={e => {
                    setQ(e.target.value)
                    debouncedSearch()
                  }}
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>
              <div className="min-w-[150px]">
                <Input
                  placeholder="Skills (e.g. Solidity)"
                  value={tag}
                  onChange={e => {
                    setTag(e.target.value)
                    debouncedSearch()
                  }}
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>
              <select
                className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
                value={remote}
                onChange={e => {
                  setRemote(e.target.value)
                  debouncedSearch()
                }}
              >
                <option value="true">🌍 Remote Only</option>
                <option value="false">🏢 On-site/Hybrid</option>
              </select>
              <select
                className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
                value={dateRange}
                onChange={e => {
                  setDateRange(e.target.value)
                  debouncedSearch()
                }}
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-400">
                {loading ? 'Searching...' : `${total.toLocaleString()} opportunities found`}
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Live data</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-400">Finding the perfect opportunities...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((job) => (
                <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-300">{job.company}</div>
                        <div className="text-xs text-slate-500">{job.postedAt ? formatDate(job.postedAt) : 'Recently'}</div>
                      </div>
                    </div>
                    <Badge className="text-xs bg-slate-700 border-slate-600">
                      {job.source}
                    </Badge>
                  </div>
                  
                  <Link href={`/jobs/${job.id}`} className="block">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.remote ? 'Remote' : job.location || 'On-site'}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(job)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(job.tags || '').split(',').filter(Boolean).slice(0, 3).map((tag) => (
                      <Badge key={tag} className="text-xs bg-slate-700 border-slate-600">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <BookmarkButton job={job} size="sm" />
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
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No opportunities found</h3>
              <p className="text-slate-400 mb-6">
                Try adjusting your search criteria or explore our trending categories
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {TRENDING_KEYWORDS.slice(0, 5).map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setQ(keyword)
                      search()
                    }}
                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-lg transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Web3 Jobs Platform?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The most comprehensive platform for Web3 career opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Opportunities</h3>
              <p className="text-slate-400">
                Connect with leading Web3 companies worldwide. 85% remote positions available.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-slate-400">
                Jobs updated daily from 100+ sources. Never miss the perfect opportunity.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Companies</h3>
              <p className="text-slate-400">
                All opportunities from verified Web3 companies and protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Alert Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <NewsletterSignup />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Web3 Jobs</h3>
              <p className="text-slate-400 mb-4">
                The leading platform for Web3, blockchain, and cryptocurrency career opportunities.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/web3jobsplatform" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                <a href="https://linkedin.com/company/web3jobsplatform" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
                <a href="https://discord.gg/web3jobs" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Discord</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Job Categories</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/jobs?q=smart+contract" className="hover:text-white transition-colors">Smart Contract Developer</Link></li>
                <li><Link href="/jobs?q=defi" className="hover:text-white transition-colors">DeFi Engineer</Link></li>
                <li><Link href="/jobs?q=blockchain+analyst" className="hover:text-white transition-colors">Blockchain Analyst</Link></li>
                <li><Link href="/jobs?q=web3+frontend" className="hover:text-white transition-colors">Web3 Frontend</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Companies</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/companies" className="hover:text-white transition-colors flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  All Companies
                </Link></li>
                <li><Link href="/jobs?q=defi+protocol" className="hover:text-white transition-colors">DeFi Protocols</Link></li>
                <li><Link href="/jobs?q=nft" className="hover:text-white transition-colors">NFT Platforms</Link></li>
                <li><Link href="/jobs?q=layer+1" className="hover:text-white transition-colors">Layer 1 Blockchains</Link></li>
                <li><Link href="/jobs?q=blockchain+infrastructure" className="hover:text-white transition-colors">Infrastructure</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/saved" className="hover:text-white transition-colors flex items-center">
                  <Bookmark className="w-4 h-4 mr-1" />
                  Saved Jobs
                </Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors flex items-center">
                  <Building className="w-4 h-4 mr-1" />
                  Companies
                </Link></li>
                <li><Link href="/salaries" className="hover:text-white transition-colors flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Salary Insights
                </Link></li>
                <li><a href="https://github.com/your-repo/web3-jobs-career-guide" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Career Guide</a></li>
                <li><a href="https://github.com/your-repo/web3-learning-path" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Learning Path</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-slate-400">
            <p>&copy; 2024 Web3 Jobs Platform. Built with Next.js + Prisma + Vercel.</p>
            <p className="text-sm mt-2">
              Connecting talented individuals with the future of decentralized technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}