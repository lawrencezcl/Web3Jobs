'use client'

import { useState } from 'react'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { MapPin, DollarSign, ExternalLink, ArrowRight, Calendar, Users, Clock } from 'lucide-react'
import BookmarkButton from './bookmark-button'
import VerificationBadge from './verification-badge'
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
  verificationStatus?: 'verified' | 'trusted' | 'featured' | 'fast-response' | 'highly-rated'
  applicationCount?: number
  companySize?: string
}

interface JobCardEnhancedProps {
  job: Job
  className?: string
  showCompanyInfo?: boolean
  compact?: boolean
}

export default function JobCardEnhanced({
  job,
  className = '',
  showCompanyInfo = true,
  compact = false
}: JobCardEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  const formatSalary = (salary?: string | null) => {
    if (!salary) return 'Competitive'
    return salary
  }

  const getSeniorityColor = (level?: string | null) => {
    if (!level) return 'bg-slate-700 border-slate-600'

    switch (level.toLowerCase()) {
      case 'senior':
      case 'lead':
        return 'bg-purple-700 border-purple-600'
      case 'mid':
      case 'intermediate':
        return 'bg-blue-700 border-blue-600'
      case 'junior':
      case 'entry':
        return 'bg-green-700 border-green-600'
      default:
        return 'bg-slate-700 border-slate-600'
    }
  }

  const getApplicationStatus = (count?: number) => {
    if (!count) return null

    if (count < 10) return { text: 'Low competition', color: 'text-green-400' }
    if (count < 50) return { text: 'Moderate competition', color: 'text-yellow-400' }
    return { text: 'High competition', color: 'text-red-400' }
  }

  const applicationStatus = getApplicationStatus(job.applicationCount)

  if (compact) {
    return (
      <Card
        className={`p-4 hover:bg-slate-800/50 transition-all duration-300 group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {job.company.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-slate-300">{job.company}</div>
              <div className="text-xs text-slate-500">{formatDate(job.postedAt || job.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {job.verificationStatus && (
              <VerificationBadge type={job.verificationStatus} size="sm" showTooltip={false} />
            )}
            <BookmarkButton job={job} size="sm" />
          </div>
        </div>

        <Link href={`/jobs/${job.id}`} className="block">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
            {job.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {job.remote ? 'Remote' : job.location || 'On-site'}
            </div>
            {job.seniorityLevel && (
              <Badge className={`text-xs ${getSeniorityColor(job.seniorityLevel)}`}>
                {job.seniorityLevel}
              </Badge>
            )}
          </div>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors"
          >
            Apply
          </a>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={`p-6 hover:bg-slate-800/50 transition-all duration-300 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold">
            {job.company.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-300">{job.company}</div>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {formatDate(job.postedAt || job.createdAt)}
              {job.companySize && (
                <>
                  <span>•</span>
                  <Users className="w-3 h-3" />
                  {job.companySize}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.verificationStatus && (
            <VerificationBadge type={job.verificationStatus} size="sm" />
          )}
          <Badge className="text-xs bg-slate-700 border-slate-600">
            {job.source}
          </Badge>
        </div>
      </div>

      <Link href={`/jobs/${job.id}`} className="block">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {job.title}
        </h3>
      </Link>

      {job.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {job.remote ? 'Remote' : job.location || 'On-site'}
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1" />
          {formatSalary(job.salary)}
        </div>
        {job.seniorityLevel && (
          <Badge className={`text-xs ${getSeniorityColor(job.seniorityLevel)}`}>
            {job.seniorityLevel}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {(job.tags || '').split(',').filter(Boolean).slice(0, 3).map((tag) => (
          <Badge key={tag} className="text-xs bg-slate-700 border-slate-600">
            {tag.trim()}
          </Badge>
        ))}
        {(job.tags || '').split(',').filter(Boolean).length > 3 && (
          <Badge className="text-xs bg-slate-700 border-slate-600">
            +{(job.tags || '').split(',').filter(Boolean).length - 3} more
          </Badge>
        )}
      </div>

      {applicationStatus && (
        <div className={`text-xs mb-4 ${applicationStatus.color} flex items-center gap-1`}>
          <Clock className="w-3 h-3" />
          {applicationStatus.text}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <BookmarkButton job={job} size="sm" />
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
        >
          Apply
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  )
}