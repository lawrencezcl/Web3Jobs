'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  MapPin,
  Code,
  Building2,
  DollarSign,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Download,
  Filter,
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalJobs: number
    totalApplications: number
    avgApplicationsPerJob: number
    activeJobs: number
    growthRate: number
    timeRange: string
  }
  recentJobs: Array<{
    id: string
    title: string
    company: string
    location: string
    remote: boolean
    applications: number
    views: number
    postedAt: string
  }>
  applicationTrends: Array<{
    date: string
    applications: number
    views: number
    jobs: number
  }>
  topLocations: Array<{
    location: string
    jobs: number
  }>
  topSkills: Array<{
    skill: string
    count: number
  }>
  companyStats: {
    totalCompanies: number
    verifiedCompanies: number
    featuredJobs: number
    totalSpent: number
    averageCostPerJob: number
  }
  performance: {
    applicationRate: number
    responseRate: number
    averageTimeToHire: number
    costPerHire: number
  }
  insights: Array<{
    type: 'positive' | 'suggestion' | 'tip' | 'warning'
    title: string
    description: string
  }>
}

const TIME_RANGES = [
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
  { value: '1year', label: 'Last year' },
]

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('applications')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/employer/analytics?timeRange=${timeRange}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'suggestion': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Info className="w-5 h-5 text-slate-400" />
    }
  }

  const getMetricColor = (value: number, type: string) => {
    if (type === 'growth') {
      return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-slate-400'
    }
    return 'text-blue-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Analytics Unavailable</h2>
            <p className="text-slate-400">
              Unable to load analytics data. Please try again later.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Employer Analytics</h1>
              <p className="text-slate-400 mt-1">
                Track your job performance and recruitment metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                {TIME_RANGES.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-blue-400" />
              <Badge className={analytics.overview.growthRate > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                {analytics.overview.growthRate > 0 ? '+' : ''}{analytics.overview.growthRate}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics.overview.totalJobs}
            </div>
            <div className="text-sm text-slate-400">Total Jobs Posted</div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics.overview.totalApplications.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Applications</div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-purple-400" />
              <span className="text-xs text-slate-500">Per job</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics.overview.avgApplicationsPerJob}
            </div>
            <div className="text-sm text-slate-400">Avg Applications</div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-orange-400" />
              <Badge className="bg-blue-500/20 text-blue-400">
                {analytics.performance.responseRate}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics.performance.applicationRate}
            </div>
            <div className="text-sm text-slate-400">Application Rate</div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-xs text-slate-500">Days</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {analytics.performance.averageTimeToHire}
            </div>
            <div className="text-sm text-slate-400">Avg Time to Hire</div>
          </Card>
        </div>

        {/* Insights */}
        {analytics.insights.length > 0 && (
          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Key Insights</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-lg">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h3 className="font-medium text-white mb-1">{insight.title}</h3>
                    <p className="text-sm text-slate-300">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Application Trends Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Application Trends</h2>
                <div className="flex gap-2">
                  {['applications', 'views', 'jobs'].map(metric => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedMetric === metric
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simple chart visualization */}
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.applicationTrends.slice(-14).map((trend, index) => {
                  const value = trend[selectedMetric as keyof typeof trend] as number
                  const maxValue = Math.max(...analytics.applicationTrends.map(t => t[selectedMetric as keyof typeof t] as number))
                  const height = (value / maxValue) * 100

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700 rounded-t relative">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all duration-300"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(trend.date)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recent Jobs Performance */}
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Job Performance</h2>
              <div className="space-y-4">
                {analytics.recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{job.company}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.remote ? 'Remote' : job.location}
                        </span>
                        <span>{formatDate(job.postedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{job.applications}</div>
                        <div className="text-slate-400">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{job.views}</div>
                        <div className="text-slate-400">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-400">
                          {job.views > 0 ? Math.round((job.applications / job.views) * 100) : 0}%
                        </div>
                        <div className="text-slate-400">Conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Stats */}
          <div className="space-y-6">
            {/* Top Locations */}
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Top Locations</h2>
              <div className="space-y-3">
                {analytics.topLocations.slice(0, 5).map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{location.location}</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {location.jobs} jobs
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Skills */}
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">In-Demand Skills</h2>
              <div className="space-y-3">
                {analytics.topSkills.slice(0, 5).map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">{skill.skill}</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {skill.count} mentions
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Company Stats */}
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Company Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Companies</span>
                  <span className="font-medium text-white">{analytics.companyStats.totalCompanies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Verified</span>
                  <span className="font-medium text-green-400">{analytics.companyStats.verifiedCompanies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Featured Jobs</span>
                  <span className="font-medium text-yellow-400">{analytics.companyStats.featuredJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Spent</span>
                  <span className="font-medium text-white">${analytics.companyStats.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Avg Cost/Job</span>
                  <span className="font-medium text-white">${analytics.companyStats.averageCostPerJob}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}