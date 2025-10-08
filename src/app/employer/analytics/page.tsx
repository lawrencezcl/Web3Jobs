'use client'
import { useAuth } from '@/contexts/auth-context'
import AnalyticsDashboard from '@/components/employer/analytics-dashboard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, BarChart3, Briefcase, Settings } from 'lucide-react'
import Link from 'next/link'

export default function EmployerAnalyticsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to access employer analytics
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
    <div>
      {/* Employer Navigation */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-8">
            <Link href="/employer/analytics" className="flex items-center gap-2 py-4 border-b-2 border-blue-500">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">Analytics</span>
            </Link>
            <Link href="/employer/jobs" className="flex items-center gap-2 py-4 border-b-2 border-transparent hover:border-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 hover:text-white">My Jobs</span>
            </Link>
            <Link href="/employer/settings" className="flex items-center gap-2 py-4 border-b-2 border-transparent hover:border-slate-600">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 hover:text-white">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  )
}