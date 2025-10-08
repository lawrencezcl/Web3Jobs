'use client'
import { useAuth } from '@/contexts/auth-context'
import FeaturedJobForm from '@/components/employer/featured-job-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PostFeaturedJobPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSubmissionSuccess = (data: any) => {
    // Redirect to payment or success page
    router.push(`/employer/featured-job/${data.featuredJob.id}/payment?paymentId=${data.payment.id}`)
  }

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
              Please sign in to post featured jobs
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
          <div className="flex items-center gap-4">
            <Link href="/employer/analytics">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Post Featured Job</h1>
              <p className="text-slate-400 mt-1">
                Get maximum visibility with premium job placement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <FeaturedJobForm onSubmitSuccess={handleSubmissionSuccess} />

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Why Choose Featured Job Posting?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3x More Applications</h3>
              <p className="text-slate-300 text-sm">
                Featured jobs receive significantly more applications from qualified candidates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Priority Placement</h3>
              <p className="text-slate-300 text-sm">
                Your job appears at the top of search results and category pages
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-300 text-sm">
                Track views, applications, and conversion rates with detailed analytics
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}