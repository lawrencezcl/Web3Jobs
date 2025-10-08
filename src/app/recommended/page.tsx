'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import BookmarkButton from '@/components/ui/bookmark-button'
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Settings,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface RecommendedJob {
  id: string
  title: string
  company: string
  location?: string | null
  remote: boolean
  tags?: string | null
  url: string
  source: string
  postedAt?: string | null
  salary?: string | null
  description?: string | null
  recommendationScore: number
  recommendationReasons: string[]
}

export default function RecommendedJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<RecommendedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
  }, [user])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/jobs/recommended', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view recommendations')
        } else {
          setError('Failed to load recommendations')
        }
        return
      }

      const data = await response.json()
      setJobs(data.recommendations || [])
      setUserProfile(data.userProfile)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
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

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-amber-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-slate-400'
  }

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Potential Match'
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-slate-400 mb-6">
            Sign in to get personalized job recommendations powered by AI
          </p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-slate-400">Analyzing your profile and finding matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Unable to Load Recommendations</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={fetchRecommendations}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI-Powered Recommendations</h1>
            <p className="text-slate-400">
              Personalized job matches based on your profile and preferences
            </p>
          </div>
        </div>

        {/* User Profile Status */}
        {userProfile && (!userProfile.hasSkills || !userProfile.hasPreferences) && (
          <Card className="p-4 mb-6 bg-amber-500/10 border-amber-500/20">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div className="flex-1">
                <p className="text-sm text-amber-400">
                  Improve your recommendations by{' '}
                  <Link href="/dashboard?tab=profile" className="underline">
                    updating your profile
                  </Link>{' '}
                  with your skills and preferences
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard?tab=profile">Update Profile</Link>
              </Button>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-slate-300">{jobs.length} recommendations</span>
          </div>
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-slate-300">Updated in real-time</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-slate-300">Matching accuracy improves with use</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {jobs.length > 0 ? (
        <div className="space-y-6">
          {jobs.map((job, index) => (
            <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Match Score */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-amber-400" />
                      <span className={`font-semibold ${getMatchColor(job.recommendationScore)}`}>
                        {job.recommendationScore}% Match
                      </span>
                      <span className="text-sm text-slate-400 ml-2">
                        ({getMatchLabel(job.recommendationScore)})
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1} Top Match
                    </Badge>
                  </div>

                  {/* Job Details */}
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold mb-2 hover:text-blue-400 transition-colors">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        {job.title}
                      </a>
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="font-medium">{job.company}</span>
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.remote ? 'Remote' : job.location}
                        </div>
                      )}
                      {job.postedAt && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(job.postedAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <Zap className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-sm font-medium text-slate-300">Why this job?</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.recommendationReasons.map((reason, idx) => (
                        <Badge key={idx} className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {job.tags && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.split(',').filter(Boolean).slice(0, 5).map((tag, idx) => (
                        <Badge key={idx} className="text-xs bg-slate-700 border-slate-600">
                          {tag.trim()}
                        </Badge>
                      ))}
                      {job.tags.split(',').filter(Boolean).length > 5 && (
                        <Badge className="text-xs bg-slate-600 border-slate-500">
                          +{job.tags.split(',').filter(Boolean).length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-6 flex flex-col items-end space-y-3">
                  {job.salary && (
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Salary</div>
                      <div className="font-semibold text-green-400">{job.salary}</div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <BookmarkButton job={job} />
                    <Button size="sm" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        Apply
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Load More */}
          <div className="text-center pt-6">
            <Button variant="outline" size="lg">
              Load More Recommendations
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-slate-400 mb-6">
            Start by saving jobs or updating your profile to get personalized recommendations
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild>
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard?tab=profile">Update Profile</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* How it Works */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-400" />
          How AI Recommendations Work
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-400">
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Skills Matching</h4>
            <p>We analyze your profile and match jobs that require your specific skills and experience</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Behavior Analysis</h4>
            <p>Your saved jobs and application history help us understand what you're looking for</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-300 mb-2">Smart Filtering</h4>
            <p>We consider your preferences for location, salary, and role to find the best matches</p>
          </div>
        </div>
      </Card>
    </div>
  )
}