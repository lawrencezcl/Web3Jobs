'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useParams, useRouter } from 'next/navigation'
import VerificationForm from '@/components/company/verification-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Building2,
} from 'lucide-react'

interface CompanyData {
  id: string
  name: string
  slug: string
  verified: boolean
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'none'
  verificationRequest?: {
    id: string
    status: string
    submittedAt: string
    reviewedAt?: string
    reviewNotes?: string
  }
}

export default function CompanyVerificationPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchCompanyVerificationStatus()
    }
  }, [params.slug])

  const fetchCompanyVerificationStatus = async () => {
    try {
      const response = await fetch(`/api/companies/verification?companyId=${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setCompany(data.company)
      }
    } catch (error) {
      console.error('Failed to fetch company verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (data: any) => {
    setSubmitting(true)
    // Refresh company data after successful submission
    setTimeout(() => {
      fetchCompanyVerificationStatus()
      setSubmitting(false)
    }, 1000)
  }

  const getVerificationIcon = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-400" />
      case 'rejected':
        return <AlertCircle className="w-6 h-6 text-red-400" />
      default:
        return <Shield className="w-6 h-6 text-slate-400" />
    }
  }

  const getVerificationStatus = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return { label: 'Verified', color: 'text-green-400', description: 'This company is verified' }
      case 'pending':
        return { label: 'Verification Pending', color: 'text-yellow-400', description: 'Verification request is under review' }
      case 'rejected':
        return { label: 'Verification Failed', color: 'text-red-400', description: 'Verification request was not approved' }
      default:
        return { label: 'Not Verified', color: 'text-slate-400', description: 'Company has not been verified' }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to access company verification
            </p>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading verification status...</p>
        </div>
      </div>
    )
  }

  const verificationStatus = getVerificationStatus(company?.verificationStatus)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">Company Verification</h1>
              {company && (
                <div className="flex items-center gap-3 mt-2">
                  <Building2 className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">{company.name}</span>
                  <div className="flex items-center gap-2">
                    {getVerificationIcon(company.verificationStatus)}
                    <span className={`font-medium ${verificationStatus.color}`}>
                      {verificationStatus.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Card */}
        {company && (
          <Card className="p-6 mb-8 bg-slate-900/50 border-slate-700">
            <div className="flex items-start gap-4">
              {getVerificationIcon(company.verificationStatus)}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Current Verification Status
                </h2>
                <p className="text-slate-300 mb-4">{verificationStatus.description}</p>

                {company.verificationRequest && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Request ID:</span>
                      <span className="text-white">{company.verificationRequest.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Submitted:</span>
                      <span className="text-white">
                        {new Date(company.verificationRequest.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {company.verificationRequest.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reviewed:</span>
                        <span className="text-white">
                          {new Date(company.verificationRequest.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {company.verificationRequest.reviewNotes && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-slate-400 text-sm mb-1">Review Notes:</p>
                        <p className="text-white">{company.verificationRequest.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Show verification form if not verified or no pending request */}
        {(!company || company.verificationStatus === 'none' || company.verificationStatus === 'rejected') && (
          <VerificationForm
            onSubmitSuccess={handleVerificationSubmit}
            initialData={{
              companyId: params.slug as string,
              companyName: company?.name || '',
              website: '',
            }}
          />
        )}

        {/* Pending verification state */}
        {company?.verificationStatus === 'pending' && (
          <Card className="p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="text-center">
              <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Verification Under Review
              </h2>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Your verification request has been submitted and is currently under review by our team.
                This process typically takes 3-5 business days. We'll notify you once a decision has been made.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  Check Status
                </Button>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Verified state */}
        {company?.verified && (
          <Card className="p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">
                Company Verified Successfully
              </h2>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Congratulations! Your company is now verified on Web3 Jobs Platform. You'll receive
                a verification badge on your company profile and job postings, helping you attract
                more qualified candidates.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">3x</div>
                  <div className="text-sm text-slate-300">More Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">↑50%</div>
                  <div className="text-sm text-slate-300">Higher Visibility</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">✓</div>
                  <div className="text-sm text-slate-300">Trust Badge</div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <Button onClick={() => router.push(`/companies/${company.slug}`)}>
                  View Company Profile
                </Button>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  Post a Job
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}