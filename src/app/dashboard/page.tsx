'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  Briefcase,
  Bookmark,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  Bell,
  Settings,
  User,
  FileText,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface Application {
  id: string
  jobId: string
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  appliedAt: string
  updatedAt: string
  coverLetter?: string
  notes?: string
  followUpAt?: string
  employerResponse?: string
  salaryOffered?: string
}

interface UserStats {
  applications: number
  savedJobs: number
  jobAlerts: number
}

const statusConfig = {
  applied: { color: 'bg-blue-500', icon: Clock, label: 'Applied' },
  interviewing: { color: 'bg-yellow-500', icon: AlertCircle, label: 'Interviewing' },
  offered: { color: 'bg-green-500', icon: CheckCircle, label: 'Offered' },
  rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
  withdrawn: { color: 'bg-gray-500', icon: AlertCircle, label: 'Withdrawn' },
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'profile'>('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [userStats, setUserStats] = useState<UserStats>({ applications: 0, savedJobs: 0, jobAlerts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApplications()
      fetchUserStats()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/user/applications?limit=5', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUserStats(data.user.stats || { applications: 0, savedJobs: 0, jobAlerts: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to access your dashboard
            </p>
            <Link href="/auth/login">
              <Button className="w-full">
                Sign In
              </Button>
            </Link>
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
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user.name || 'User'}! 👋
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your job applications and profile
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/jobs">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'applications'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Applications</p>
                    <p className="text-3xl font-bold text-white mt-1">{userStats.applications}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-blue-400" />
                </div>
                <Link href="/dashboard/applications">
                  <Button variant="outline" size="sm" className="mt-4 w-full border-slate-600 hover:bg-slate-800">
                    View All
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Saved Jobs</p>
                    <p className="text-3xl font-bold text-white mt-1">{userStats.savedJobs}</p>
                  </div>
                  <Bookmark className="w-8 h-8 text-green-400" />
                </div>
                <Link href="/saved">
                  <Button variant="outline" size="sm" className="mt-4 w-full border-slate-600 hover:bg-slate-800">
                    View Saved
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Job Alerts</p>
                    <p className="text-3xl font-bold text-white mt-1">{userStats.jobAlerts}</p>
                  </div>
                  <Bell className="w-8 h-8 text-purple-400" />
                </div>
                <Link href="/dashboard/alerts">
                  <Button variant="outline" size="sm" className="mt-4 w-full border-slate-600 hover:bg-slate-800">
                    Manage Alerts
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Recent Applications */}
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <Link href="/dashboard/applications">
                  <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800">
                    View All
                  </Button>
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No applications yet</h3>
                  <p className="text-slate-400 mb-4">
                    Start applying to Web3 jobs to track them here
                  </p>
                  <Link href="/jobs">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-white">Job ID: {application.jobId}</h4>
                          {getStatusBadge(application.status)}
                        </div>
                        <p className="text-sm text-slate-400">
                          Applied on {formatDate(application.appliedAt)}
                        </p>
                        {application.notes && (
                          <p className="text-sm text-slate-300 mt-2">{application.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">All Applications</h2>
                <Link href="/jobs">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Button>
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No applications found</h3>
                  <p className="text-slate-400 mb-6">
                    You haven't applied to any jobs yet
                  </p>
                  <Link href="/jobs">
                    <Button size="lg">
                      Start Browsing Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-slate-700 rounded-lg p-6 bg-slate-800/50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">Job ID: {application.jobId}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>Applied: {formatDate(application.appliedAt)}</span>
                            <span>Updated: {formatDate(application.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {application.coverLetter && (
                        <div className="mb-4">
                          <h4 className="font-medium text-slate-300 mb-2">Cover Letter</h4>
                          <p className="text-slate-400 text-sm">{application.coverLetter}</p>
                        </div>
                      )}

                      {application.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-slate-300 mb-2">Notes</h4>
                          <p className="text-slate-400 text-sm">{application.notes}</p>
                        </div>
                      )}

                      {application.employerResponse && (
                        <div className="mb-4">
                          <h4 className="font-medium text-slate-300 mb-2">Employer Response</h4>
                          <p className="text-slate-400 text-sm">{application.employerResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                  <Input
                    value={user.name || ''}
                    disabled
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              <div className="mt-6">
                <Link href="/dashboard/profile/edit">
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}