'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { Button } from './button'
import { useSavedJobs, type Job } from '@/hooks/useSavedJobs'

interface BookmarkButtonProps {
  job?: Job
  jobId?: string
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
  className?: string
}

export default function BookmarkButton({
  job,
  jobId,
  variant = 'outline',
  size = 'default',
  showLabel = false,
  className = ''
}: BookmarkButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const { isJobSaved, toggleSaveJob, isLoaded } = useSavedJobs()

  // Handle both cases: when a full job object is provided or when only jobId is provided
  const actualJobId = job?.id || jobId
  const actualJob = job

  if (!actualJobId) {
    console.warn('BookmarkButton: Neither job nor jobId provided')
    return null
  }

  const isSaved = isLoaded && isJobSaved(actualJobId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoaded || !actualJob) return

    setIsAnimating(true)
    const newSaveState = toggleSaveJob(actualJob)

    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    // Animation duration
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)

    // Optional: Show toast notification
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(
        newSaveState ? 'Job saved!' : 'Job removed from saved',
        'success'
      )
    }
  }

  const getButtonContent = () => {
    if (isAnimating) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {showLabel && <span className="ml-2">Saving...</span>}
        </>
      )
    }

    if (isSaved) {
      return (
        <>
          <BookmarkCheck className="w-4 h-4" />
          {showLabel && <span className="ml-2">Saved</span>}
        </>
      )
    }

    return (
      <>
        <Bookmark className="w-4 h-4" />
        {showLabel && <span className="ml-2">Save</span>}
      </>
    )
  }

  return (
    <Button
      variant={isSaved ? 'default' : (variant === 'destructive' ? 'outline' : variant)}
      size={size === 'default' ? 'md' : (size === 'icon' ? 'sm' : size)}
      onClick={handleClick}
      disabled={!isLoaded || isAnimating}
      className={`transition-all duration-300 ${
        isSaved
          ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
          : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-slate-700'
      } ${isAnimating ? 'scale-95' : 'scale-100'} ${className}`}
      title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
    >
      {getButtonContent()}
    </Button>
  )
}

// Compact version for job cards
export function CompactBookmarkButton({ job, jobId, className = '' }: { job?: Job; jobId?: string; className?: string }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const { isJobSaved, toggleSaveJob, isLoaded } = useSavedJobs()

  // Handle both cases: when a full job object is provided or when only jobId is provided
  const actualJobId = job?.id || jobId
  const actualJob = job

  if (!actualJobId) {
    console.warn('CompactBookmarkButton: Neither job nor jobId provided')
    return null
  }

  const isSaved = isLoaded && isJobSaved(actualJobId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoaded || !actualJob) return

    setIsAnimating(true)
    toggleSaveJob(actualJob)

    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }

    setTimeout(() => {
      setIsAnimating(false)
    }, 200)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isLoaded || isAnimating}
      className={`p-2 rounded-full transition-all duration-200 ${
        isSaved
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
      } ${isAnimating ? 'scale-90' : 'scale-100'} ${className}`}
      title={isSaved ? 'Remove from saved jobs' : 'Save this job'}
    >
      {isAnimating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </button>
  )
}

// Text-only version for lists
export function TextBookmarkButton({ job, jobId, className = '' }: { job?: Job; jobId?: string; className?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { isJobSaved, toggleSaveJob, isLoaded } = useSavedJobs()

  // Handle both cases: when a full job object is provided or when only jobId is provided
  const actualJobId = job?.id || jobId
  const actualJob = job

  if (!actualJobId) {
    console.warn('TextBookmarkButton: Neither job nor jobId provided')
    return null
  }

  const isSaved = isLoaded && isJobSaved(actualJobId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoaded || !actualJob) return

    setIsLoading(true)
    toggleSaveJob(actualJob)

    setTimeout(() => {
      setIsLoading(false)
    }, 300)
  }

  return (
    <button
      onClick={handleClick}
      disabled={!isLoaded || isLoading}
      className={`text-sm font-medium transition-colors duration-200 ${
        isSaved
          ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
      } ${isLoading ? 'opacity-50' : ''} ${className}`}
    >
      {isLoading ? (
        'Loading...'
      ) : isSaved ? (
        <span className="flex items-center">
          <BookmarkCheck className="w-4 h-4 mr-1" />
          Saved
        </span>
      ) : (
        <span className="flex items-center">
          <Bookmark className="w-4 h-4 mr-1" />
          Save Job
        </span>
      )}
    </button>
  )
}