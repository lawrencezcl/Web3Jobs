'use client'

import { formatDistanceToNow } from 'date-fns'
import { MapPin, DollarSign, Calendar, ExternalLink, Share2, Building, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Job {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  salary: string
  employmentType: string
  postedAt: string
  url: string
  tags: string[]
  description: string
}

interface TelegramWebApp {
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  openLink: (url: string) => void
}

interface JobListProps {
  jobs: Job[]
  onApply: (jobUrl: string) => void
  onShare: (job: Job) => void
  telegram: TelegramWebApp | null
}

export function JobList({ jobs, onApply, onShare, telegram }: JobListProps) {
  const formatSalary = (salary: string) => {
    if (salary.includes('k')) {
      return salary.replace('k', 'k')
    }
    return salary
  }

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return 'Recently'
    }
  }

  const getEmploymentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'contract':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'freelance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const handleApply = (jobUrl: string) => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('medium')
    }
    onApply(jobUrl)
  }

  const handleShare = (job: Job) => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')
    }
    onShare(job)
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="w-4 h-4" />
                <span>{job.company}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShare(job)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {job.remote ? 'Remote' : job.location}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {formatSalary(job.salary)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {getRelativeTime(job.postedAt)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employmentType)}`}>
                {job.employmentType}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {job.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                +{job.tags.length - 4} more
              </span>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={() => handleApply(job.url)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}