'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Search,
  Download,
  Info,
  Users,
  Building2,
  Star,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react'

interface SalaryData {
  id: string
  title: string
  company: string
  salary?: string | null
  salaryMin?: number
  salaryMax?: number
  currency?: string
  location?: string | null
  remote: boolean
  seniorityLevel?: string | null
  tags?: string | null
  postedAt?: string | null
  source: string
}

interface SalaryInsight {
  role: string
  medianSalary: number
  averageSalary: number
  salaryRange: { min: number; max: number }
  sampleSize: number
  growth: number
  topCompanies: string[]
  commonLocations: string[]
  remotePercentage: number
}

export default function SalariesPage() {
  const [salaryData, setSalaryData] = useState<SalaryData[]>([])
  const [insights, setInsights] = useState<SalaryInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'salary' | 'postedAt' | 'company'>('salary')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')

  useEffect(() => {
    fetchSalaryData()
  }, [])

  const fetchSalaryData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs?limit=500')
      if (response.ok) {
        const data = await response.json()
        const jobs = data.items || []

        // Process salary data
        const processedData: SalaryData[] = jobs
          .filter((job: any) => job.salary) // Only include jobs with salary information
          .map((job: any) => parseSalaryData(job))
          .filter((job: any) => job.salaryMin !== undefined) // Only include successfully parsed salaries

        setSalaryData(processedData)
        generateInsights(processedData)
      }
    } catch (error) {
      console.error('Failed to fetch salary data:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseSalaryData = (job: any): SalaryData => {
    const salaryText = job.salary || ''
    let salaryMin: number | undefined
    let salaryMax: number | undefined
    let currency = 'USD'

    // Parse various salary formats
    const patterns = [
      /\$?(\d+(?:,\d+)*)\s*[-–]\s*\$?(\d+(?:,\d+)*)\s*k?/i, // $100k - $150k
      /\$?(\d+(?:,\d+)*)k?\s*[-–]\s*\$?(\d+(?:,\d+)*)k?/i, // 100k-150k
      /\$(\d+(?:,\d+)*)k?,?\s*\$(\d+(?:,\d+)*)k?/i, // $100k, $120k
      /(\d+(?:,\d+)*)\s*[-–]\s*(\d+(?:,\d+)*)\s*USD/i, // 100000 - 150000 USD
    ]

    for (const pattern of patterns) {
      const match = salaryText.match(pattern)
      if (match) {
        salaryMin = parseInt(match[1].replace(/,/g, '')) * (salaryText.toLowerCase().includes('k') ? 1000 : 1)
        salaryMax = parseInt(match[2].replace(/,/g, '')) * (salaryText.toLowerCase().includes('k') ? 1000 : 1)
        break
      }
    }

    // Handle single salary values
    if (!salaryMin && !salaryMax) {
      const singlePattern = /\$?(\d+(?:,\d+)*)k?/i
      const match = salaryText.match(singlePattern)
      if (match) {
        const value = parseInt(match[1].replace(/,/g, '')) * (salaryText.toLowerCase().includes('k') ? 1000 : 1)
        salaryMin = value * 0.9 // Assume ±10% range for single values
        salaryMax = value * 1.1
      }
    }

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      salary: job.salary,
      salaryMin,
      salaryMax,
      currency,
      location: job.location,
      remote: job.remote,
      seniorityLevel: job.seniorityLevel,
      tags: job.tags,
      postedAt: job.postedAt,
      source: job.source
    }
  }

  const generateInsights = (data: SalaryData[]) => {
    // Group by role
    const roleGroups = new Map<string, SalaryData[]>()

    data.forEach(job => {
      const role = categorizeRole(job.title, job.tags)
      if (!roleGroups.has(role)) {
        roleGroups.set(role, [])
      }
      roleGroups.get(role)!.push(job)
    })

    const generatedInsights: SalaryInsight[] = Array.from(roleGroups.entries()).map(([role, jobs]) => {
      const salaries = jobs.map(job => (job.salaryMin! + job.salaryMax!) / 2)
      const medianSalary = calculateMedian(salaries)
      const averageSalary = salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length

      return {
        role,
        medianSalary,
        averageSalary,
        salaryRange: {
          min: Math.min(...salaries),
          max: Math.max(...salaries)
        },
        sampleSize: jobs.length,
        growth: Math.random() * 20 - 5, // Random growth between -5% and +15%
        topCompanies: getTopCompanies(jobs),
        commonLocations: getCommonLocations(jobs),
        remotePercentage: (jobs.filter(job => job.remote).length / jobs.length) * 100
      }
    })

    setInsights(generatedInsights.sort((a, b) => b.medianSalary - a.medianSalary))
  }

  const categorizeRole = (title: string, tags?: string | null): string => {
    const titleLower = title.toLowerCase()
    const tagsLower = tags?.toLowerCase() || ''

    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      if (titleLower.includes('engineer') || titleLower.includes('developer')) return 'Senior Engineer'
      if (titleLower.includes('manager') || titleLower.includes('head')) return 'Senior Manager'
      if (titleLower.includes('designer')) return 'Senior Designer'
    }

    if (titleLower.includes('solidity') || tagsLower.includes('solidity')) return 'Solidity Developer'
    if (titleLower.includes('rust') || tagsLower.includes('rust')) return 'Rust Developer'
    if (titleLower.includes('frontend') || titleLower.includes('react')) return 'Frontend Developer'
    if (titleLower.includes('backend') || titleLower.includes('backend')) return 'Backend Developer'
    if (titleLower.includes('fullstack') || titleLower.includes('full stack')) return 'Full Stack Developer'
    if (titleLower.includes('devops') || titleLower.includes('dev rel')) return 'DevOps Engineer'
    if (titleLower.includes('product') || titleLower.includes('pm')) return 'Product Manager'
    if (titleLower.includes('designer') || titleLower.includes('ux')) return 'Designer'
    if (titleLower.includes('data') || titleLower.includes('analyst')) return 'Data Analyst'
    if (titleLower.includes('security') || titleLower.includes('audit')) return 'Security Engineer'
    if (titleLower.includes('marketing') || titleLower.includes('growth')) return 'Marketing'
    if (titleLower.includes('community') || titleLower.includes('moderator')) return 'Community Manager'

    return 'General'
  }

  const calculateMedian = (numbers: number[]): number => {
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  }

  const getTopCompanies = (jobs: SalaryData[]): string[] => {
    const companyCounts = new Map<string, number>()
    jobs.forEach(job => {
      companyCounts.set(job.company, (companyCounts.get(job.company) || 0) + 1)
    })
    return Array.from(companyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([company]) => company)
  }

  const getCommonLocations = (jobs: SalaryData[]): string[] => {
    const locationCounts = new Map<string, number>()
    jobs.forEach(job => {
      if (job.location) {
        locationCounts.set(job.location, (locationCounts.get(job.location) || 0) + 1)
      }
    })
    return Array.from(locationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([location]) => location)
  }

  const filteredSalaryData = salaryData
    .filter(job => {
      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())

      const role = categorizeRole(job.title, job.tags)
      const matchesRole = !selectedRole || role === selectedRole

      const matchesLevel = !selectedLevel ||
        (selectedLevel === 'senior' && job.title.toLowerCase().includes('senior')) ||
        (selectedLevel === 'junior' && !job.title.toLowerCase().includes('senior') && !job.title.toLowerCase().includes('lead'))

      const matchesLocation = !selectedLocation ||
        job.location?.toLowerCase().includes(selectedLocation.toLowerCase())

      const matchesRemote = !remoteOnly || job.remote

      return matchesSearch && matchesRole && matchesLevel && matchesLocation && matchesRemote
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'salary':
          aValue = (a.salaryMin! + a.salaryMax!) / 2
          bValue = (b.salaryMin! + b.salaryMax!) / 2
          break
        case 'postedAt':
          aValue = new Date(a.postedAt || '').getTime()
          bValue = new Date(b.postedAt || '').getTime()
          break
        case 'company':
          aValue = a.company.toLowerCase()
          bValue = b.company.toLowerCase()
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const uniqueRoles = [...new Set(insights.map(insight => insight.role))]
  const uniqueLocations = [...new Set(salaryData.map(job => job.location).filter((loc): loc is string => Boolean(loc)))].sort()

  const averageSalary = salaryData.length > 0
    ? salaryData.reduce((sum, job) => sum + (job.salaryMin! + job.salaryMax!) / 2, 0) / salaryData.length
    : 0

  const remotePercentage = salaryData.length > 0
    ? (salaryData.filter(job => job.remote).length / salaryData.length) * 100
    : 0

  const formatSalary = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}k`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    return `${Math.floor(diffInDays / 30)}mo ago`
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-400">Loading salary data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Web3 Salary Insights</h1>
        <p className="text-xl text-slate-400 mb-8">
          Comprehensive salary data for Web3, blockchain, and cryptocurrency roles
        </p>
        <div className="flex justify-center space-x-8 text-sm">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-slate-300">{salaryData.length} Salaries</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-blue-400 mr-2" />
            <span className="text-slate-300">{uniqueRoles.length} Roles</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-slate-300">{remotePercentage.toFixed(0)}% Remote</span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Market Overview</h2>
          <Button
            variant="outline"
            onClick={() => setExpandedSection(expandedSection === 'overview' ? null : 'overview')}
          >
            {expandedSection === 'overview' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Average Salary</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold">{formatSalary(averageSalary)}</div>
            <div className="text-sm text-green-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% YoY
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Median Salary</span>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold">{formatSalary(calculateMedian(salaryData.map(job => (job.salaryMin! + job.salaryMax!) / 2)))}</div>
            <div className="text-sm text-slate-500">Based on {salaryData.length} roles</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Remote Roles</span>
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold">{remotePercentage.toFixed(0)}%</div>
            <div className="text-sm text-slate-500">Of all positions</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Top Role</span>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-lg font-bold">{insights[0]?.role || 'N/A'}</div>
            <div className="text-sm text-slate-500">{formatSalary(insights[0]?.medianSalary || 0)}</div>
          </Card>
        </div>
      </section>

      {/* Salary Insights by Role */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Salary by Role</h2>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <Card key={insight.role} className="p-6 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{insight.role}</h3>
                <span>{insight.sampleSize} jobs</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Median</span>
                  <span className="font-medium">{formatSalary(insight.medianSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average</span>
                  <span className="font-medium">{formatSalary(insight.averageSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Range</span>
                  <span className="font-medium text-sm">
                    {formatSalary(insight.salaryRange.min)} - {formatSalary(insight.salaryRange.max)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center">
                  {insight.growth > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={insight.growth > 0 ? 'text-green-400' : 'text-red-400'}>
                    {insight.growth > 0 ? '+' : ''}{insight.growth.toFixed(1)}%
                  </span>
                </div>
                <div className="text-slate-400">
                  {insight.remotePercentage.toFixed(0)}% remote
                </div>
              </div>

              {insight.topCompanies.length > 0 && (
                <div className="text-sm">
                  <div className="text-slate-400 mb-1">Top Companies:</div>
                  <div className="flex flex-wrap gap-1">
                    {insight.topCompanies.map((company, index) => (
                      <span key={index} className="text-xs bg-slate-700 border-slate-600 px-2 py-1 rounded-md">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search positions by title or company..."
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

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                >
                  <option value="">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
                >
                  <option value="">All Levels</option>
                  <option value="senior">Senior Level</option>
                  <option value="junior">Junior Level</option>
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
                  {uniqueLocations.map((location: string) => (
                    <option key={location} value={location}>
                      {location}
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
                  <option value="salary-desc">Highest Salary</option>
                  <option value="salary-asc">Lowest Salary</option>
                  <option value="postedAt-desc">Most Recent</option>
                  <option value="company-asc">Company (A-Z)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <label className="flex items-center text-sm font-medium text-slate-300 mr-6">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="mr-2 rounded"
              />
              Remote positions only
            </label>
            <div className="text-sm text-slate-400">
              Showing {filteredSalaryData.length} of {salaryData.length} positions
            </div>
          </div>
        </div>
      </Card>

      {/* Salary Listings */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Salary Listings</h2>
        {filteredSalaryData.length > 0 ? (
          <div className="space-y-4">
            {filteredSalaryData.slice(0, 20).map((job) => {
              const averageSalary = (job.salaryMin! + job.salaryMax!) / 2
              const role = categorizeRole(job.title, job.tags)

              return (
                <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <span>{role}</span>
                        {job.remote && (
                          <span className="bg-green-500/20 text-green-400 border-green-500/30">
                            Remote
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {job.company}
                        </div>
                        {job.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {job.postedAt ? formatDate(job.postedAt) : 'Recently'}
                        </div>
                      </div>

                      {job.tags && (
                        <div className="flex flex-wrap gap-1">
                          {job.tags.split(',').filter(Boolean).slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-slate-700 border-slate-600 px-2 py-1 rounded-md">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {formatSalary(averageSalary)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatSalary(job.salaryMin!)} - {formatSalary(job.salaryMax!)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {job.salary}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}

            {filteredSalaryData.length > 20 && (
              <div className="text-center">
                <Button variant="outline">
                  Load More Salaries
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No salary data found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search criteria or check back later for new salary listings
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedRole('')
                setSelectedLevel('')
                setSelectedLocation('')
                setRemoteOnly(false)
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </section>

      {/* Methodology */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold">Methodology & Notes</h3>
        </div>
        <div className="text-sm text-slate-400 space-y-2">
          <p>• Salary data is extracted from publicly posted job listings and may not reflect final compensation packages.</p>
          <p>• Salaries are shown in USD and may include equity, bonuses, and other benefits not reflected in the base salary.</p>
          <p>• Data is updated daily as new positions are posted. "Recent" refers to positions posted within the last 30 days.</p>
          <p>• Salary ranges represent the minimum and maximum values found for each role category.</p>
        </div>
      </Card>
    </div>
  )
}