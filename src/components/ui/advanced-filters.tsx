'use client'

import { useState, useEffect } from 'react'
import { Filter, X, DollarSign, Briefcase, MapPin, Clock } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { Badge } from './badge'
import { Input } from './input'

interface AdvancedFiltersProps {
  onFiltersChange: (filters: {
    salaryMin?: string
    salaryMax?: string
    experienceLevel?: string
    companySize?: string
    jobType?: string
    region?: string
    timezone?: string
  }) => void
  className?: string
}

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5-8 years)' },
  { value: 'lead', label: 'Lead/Principal (8+ years)' },
  { value: 'executive', label: 'Executive/Director' }
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
]

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' }
]

const REGIONS = [
  { value: 'global', label: 'Global / Remote' },
  { value: 'us', label: 'United States' },
  { value: 'eu', label: 'Europe' },
  { value: 'asia', label: 'Asia Pacific' },
  { value: 'latam', label: 'Latin America' },
  { value: 'africa', label: 'Africa' }
]

const TIMEZONES = [
  { value: 'any', label: 'Any Timezone' },
  { value: 'est', label: 'EST (UTC-5/-4)' },
  { value: 'pst', label: 'PST (UTC-8/-7)' },
  { value: 'gmt', label: 'GMT (UTC+0)' },
  { value: 'cet', label: 'CET (UTC+1/+2)' },
  { value: 'jst', label: 'JST (UTC+9)' },
  { value: 'aest', label: 'AEST (UTC+10/+11)' }
]

export default function AdvancedFilters({ onFiltersChange, className = '' }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(0)

  const [filters, setFilters] = useState({
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
    companySize: '',
    jobType: '',
    region: '',
    timezone: ''
  })

  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '').length
    setActiveFilters(count)
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      salaryMin: '',
      salaryMax: '',
      experienceLevel: '',
      companySize: '',
      jobType: '',
      region: '',
      timezone: ''
    })
  }

  const removeFilter = (key: string) => {
    updateFilter(key, '')
  }

  const formatSalary = (value: string) => {
    if (!value) return ''
    const num = value.replace(/\D/g, '')
    if (!num) return ''
    return `$${parseInt(num).toLocaleString()}`
  }

  const parseSalary = (value: string) => {
    return value.replace(/\D/g, '')
  }

  return (
    <div className={className}>
      {/* Active Filters Display */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(filters).map(([key, value]) =>
            value ? (
              <Badge
                key={key}
                variant="outline"
                className="bg-blue-500/10 border-blue-500/20 text-blue-300 flex items-center gap-1"
              >
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-400"
                  onClick={() => removeFilter(key)}
                />
                {key === 'salaryMin' && `Min: $${parseInt(value).toLocaleString()}`}
                {key === 'salaryMax' && `Max: $${parseInt(value).toLocaleString()}`}
                {key === 'experienceLevel' && EXPERIENCE_LEVELS.find(l => l.value === value)?.label}
                {key === 'companySize' && COMPANY_SIZES.find(s => s.value === value)?.label}
                {key === 'jobType' && JOB_TYPES.find(t => t.value === value)?.label}
                {key === 'region' && REGIONS.find(r => r.value === value)?.label}
                {key === 'timezone' && TIMEZONES.find(t => t.value === value)?.label}
              </Badge>
            ) : null
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Toggle Button */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1 bg-blue-500 text-white">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <Card className="mt-4 p-6 border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Salary Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <DollarSign className="w-4 h-4" />
                Salary Range (USD)
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Min"
                  value={formatSalary(filters.salaryMin)}
                  onChange={(e) => updateFilter('salaryMin', parseSalary(e.target.value))}
                  className="bg-slate-800 border-slate-600"
                />
                <span className="text-slate-400">-</span>
                <Input
                  placeholder="Max"
                  value={formatSalary(filters.salaryMax)}
                  onChange={(e) => updateFilter('salaryMax', parseSalary(e.target.value))}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Briefcase className="w-4 h-4" />
                Experience Level
              </div>
              <select
                value={filters.experienceLevel}
                onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Any level</option>
                {EXPERIENCE_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <div className="w-4 h-4 rounded border border-slate-400" />
                Company Size
              </div>
              <select
                value={filters.companySize}
                onChange={(e) => updateFilter('companySize', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Any size</option>
                {COMPANY_SIZES.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Clock className="w-4 h-4" />
                Job Type
              </div>
              <select
                value={filters.jobType}
                onChange={(e) => updateFilter('jobType', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Any type</option>
                {JOB_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <MapPin className="w-4 h-4" />
                Region
              </div>
              <select
                value={filters.region}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Any region</option>
                {REGIONS.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Clock className="w-4 h-4" />
                Timezone
              </div>
              <select
                value={filters.timezone}
                onChange={(e) => updateFilter('timezone', e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-slate-600 hover:bg-slate-800"
            >
              Clear Filters
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Apply Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}