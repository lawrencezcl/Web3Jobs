'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Badge } from './badge'
import { Card } from './card'
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Calendar,
} from 'lucide-react'

interface SearchFilters {
  query: string
  tags: string[]
  companies: string[]
  locations: string[]
  remote: boolean
  salaryMin: string
  salaryMax: string
  currency: string
  experienceLevel: string
  employmentType: string
  datePosted: string
  companySize: string
  industry: string
  featured: boolean
}

interface EnhancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  className?: string
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead/Principal' },
  { value: 'executive', label: 'Executive' },
]

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
]

const DATE_POSTED_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: '3months', label: 'Last 3 months' },
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
]

const INDUSTRIES = [
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFT/Gaming' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'venture', label: 'Venture Capital' },
  { value: 'media', label: 'Media/Content' },
  { value: 'education', label: 'Education' },
]

const TRENDING_TAGS = [
  'Solidity', 'Rust', 'TypeScript', 'React', 'Node.js',
  'DeFi', 'NFT', 'Smart Contracts', 'Ethereum', 'Solana',
  'Layer 2', 'Web3', 'Blockchain', 'DAO', 'Trading'
]

const POPULAR_COMPANIES = [
  'Coinbase', 'Uniswap', 'Aave', 'Chainlink', 'Polygon',
  'OpenSea', 'MetaMask', 'Consensys', 'Gemini', 'Kraken'
]

export default function EnhancedSearch({
  onFiltersChange,
  initialFilters = {},
  className = ''
}: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    companies: [],
    locations: [],
    remote: true,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    experienceLevel: '',
    employmentType: '',
    datePosted: '',
    companySize: '',
    industry: '',
    featured: false,
    ...initialFilters,
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    onFiltersChange(filters)
    calculateActiveFilters()
  }, [filters, onFiltersChange])

  const calculateActiveFilters = useCallback(() => {
    let count = 0
    if (filters.query) count++
    if (filters.tags.length > 0) count++
    if (filters.companies.length > 0) count++
    if (filters.locations.length > 0) count++
    if (!filters.remote) count++
    if (filters.salaryMin) count++
    if (filters.salaryMax) count++
    if (filters.experienceLevel) count++
    if (filters.employmentType) count++
    if (filters.datePosted) count++
    if (filters.companySize) count++
    if (filters.industry) count++
    if (filters.featured) count++

    setActiveFiltersCount(count)
  }, [filters])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag))
  }

  const addCompany = (company: string) => {
    if (!filters.companies.includes(company)) {
      updateFilter('companies', [...filters.companies, company])
    }
  }

  const removeCompany = (company: string) => {
    updateFilter('companies', filters.companies.filter(c => c !== company))
  }

  const clearAllFilters = () => {
    setFilters({
      query: '',
      tags: [],
      companies: [],
      locations: [],
      remote: true,
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      experienceLevel: '',
      employmentType: '',
      datePosted: '',
      companySize: '',
      industry: '',
      featured: false,
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <Card className="p-4 bg-slate-900/50 border-slate-700">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search jobs, companies, or keywords..."
              value={filters.query}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="pl-10 pr-4 py-3 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            className={`border-slate-600 hover:bg-slate-800 ${
              activeFiltersCount > 0 ? 'border-blue-500 text-blue-400' : ''
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.companies.length > 0 || activeFiltersCount > 0) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-slate-400">Active filters:</span>
            {filters.tags.map(tag => (
              <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-blue-100">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {filters.companies.map(company => (
              <Badge key={company} className="bg-purple-500/20 text-purple-300 border-purple-500/30 flex items-center gap-1">
                {company}
                <button onClick={() => removeCompany(company)} className="hover:text-purple-100">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-400 hover:text-white ml-auto"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="p-6 bg-slate-900/50 border-slate-700">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Employment Type
              </label>
              <select
                value={filters.employmentType}
                onChange={(e) => updateFilter('employmentType', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Type</option>
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Level</option>
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Date Posted */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date Posted
              </label>
              <select
                value={filters.datePosted}
                onChange={(e) => updateFilter('datePosted', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Time</option>
                {DATE_POSTED_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Salary Range ({filters.currency})
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(e) => updateFilter('salaryMin', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(e) => updateFilter('salaryMax', e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <Building className="w-4 h-4 inline mr-2" />
                Company Size
              </label>
              <select
                value={filters.companySize}
                onChange={(e) => updateFilter('companySize', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Size</option>
                {COMPANY_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                <Star className="w-4 h-4 inline mr-2" />
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) => updateFilter('industry', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Any Industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry.value} value={industry.value}>{industry.label}</option>
                ))}
              </select>
            </div>

            {/* Remote Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="remote-only"
                checked={filters.remote}
                onChange={(e) => updateFilter('remote', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="remote-only" className="text-sm font-medium text-slate-300">
                Remote jobs only
              </label>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured-only"
                checked={filters.featured}
                onChange={(e) => updateFilter('featured', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured-only" className="text-sm font-medium text-slate-300">
                Featured jobs only
              </label>
            </div>
          </div>

          {/* Quick Tags */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Popular Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Popular Companies
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_COMPANIES.map(company => (
                  <button
                    key={company}
                    onClick={() => addCompany(company)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      filters.companies.includes(company)
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {company}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}