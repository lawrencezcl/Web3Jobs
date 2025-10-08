'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Globe,
  Mail,
  User,
  MapPin,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  ExternalLink,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react'

interface VerificationFormProps {
  onSubmitSuccess?: (data: any) => void
  initialData?: Partial<VerificationFormData>
}

interface VerificationFormData {
  companyId: string
  companyName: string
  website: string
  contactEmail: string
  contactName: string
  companySize: string
  industry: string
  founded: number
  description: string
  hqLocation: string
  socialLinks: {
    linkedin: string
    twitter: string
    github: string
  }
  documents: {
    businessLicense: string
    certificate: string
    taxDocument: string
  }
  additionalInfo: string
}

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
]

const INDUSTRIES = [
  { value: 'defi', label: 'DeFi / Decentralized Finance' },
  { value: 'nft', label: 'NFT / Digital Collectibles' },
  { value: 'gaming', label: 'Blockchain Gaming' },
  { value: 'infrastructure', label: 'Blockchain Infrastructure' },
  { value: 'exchange', label: 'Cryptocurrency Exchange' },
  { value: 'consulting', label: 'Blockchain Consulting' },
  { value: 'venture', label: 'Venture Capital / Investment' },
  { value: 'media', label: 'Media / Content Platform' },
  { value: 'education', label: 'Education / Research' },
  { value: 'mining', label: 'Mining / Staking' },
  { value: 'other', label: 'Other' },
]

export default function VerificationForm({ onSubmitSuccess, initialData }: VerificationFormProps) {
  const [formData, setFormData] = useState<VerificationFormData>({
    companyId: '',
    companyName: '',
    website: '',
    contactEmail: '',
    contactName: '',
    companySize: '',
    industry: '',
    founded: new Date().getFullYear(),
    description: '',
    hqLocation: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
    },
    documents: {
      businessLicense: '',
      certificate: '',
      taxDocument: '',
    },
    additionalInfo: '',
    ...initialData,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (field: keyof VerificationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleNestedChange = (parent: keyof VerificationFormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }))
  }

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.companyId && formData.companyName && formData.website)
      case 2:
        return !!(formData.contactEmail && formData.contactName && formData.companySize && formData.industry)
      case 3:
        return !!(formData.description && formData.hqLocation)
      case 4:
        return true // Documents and additional info are optional
      default:
        return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/companies/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        onSubmitSuccess?.(data)
      } else {
        setError(data.error || 'Verification submission failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return <Building2 className="w-4 h-4" />
      case 2: return <User className="w-4 h-4" />
      case 3: return <FileText className="w-4 h-4" />
      case 4: return <Shield className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return 'Company Information'
      case 2: return 'Contact Details'
      case 3: return 'Company Profile'
      case 4: return 'Verification Documents'
      default: return 'Review'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Company Verification Program
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Get your company verified on Web3 Jobs Platform to build trust with candidates
          and increase visibility for your job postings.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  step === stepNumber
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : step > stepNumber
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-600 text-slate-400'
                }`}
              >
                {step > stepNumber ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  getStepIcon(stepNumber)
                )}
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`w-full h-0.5 mx-4 transition-colors ${
                    step > stepNumber ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
            <div key={stepNumber} className="text-center flex-1">
              <p className={`text-xs font-medium ${
                step >= stepNumber ? 'text-white' : 'text-slate-500'
              }`}>
                {getStepTitle(stepNumber)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-8 bg-slate-900/50 border-slate-700">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Basic Company Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company ID *
                  </label>
                  <Input
                    value={formData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                    placeholder="company-name"
                    className="bg-slate-800 border-slate-600"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This will be used in your company profile URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name *
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Acme Blockchain Inc."
                    className="bg-slate-800 border-slate-600"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Website *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10 bg-slate-800 border-slate-600"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      placeholder="John Doe"
                      className="pl-10 bg-slate-800 border-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="john@example.com"
                      className="pl-10 bg-slate-800 border-slate-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Size *
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    <option value="">Select company size</option>
                    {COMPANY_SIZES.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(industry => (
                      <option key={industry.value} value={industry.value}>{industry.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Founded Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      value={formData.founded}
                      onChange={(e) => handleInputChange('founded', parseInt(e.target.value))}
                      placeholder="2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    HQ Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.hqLocation}
                      onChange={(e) => handleInputChange('hqLocation', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="pl-10 bg-slate-800 border-slate-600"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Company Profile */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Company Profile
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your company, mission, and what makes you unique..."
                  rows={6}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 50 characters
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Social Media Links</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Linkedin className="w-4 h-4 inline mr-2" />
                      LinkedIn
                    </label>
                    <Input
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Twitter className="w-4 h-4 inline mr-2" />
                      Twitter
                    </label>
                    <Input
                      value={formData.socialLinks.twitter}
                      onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                      placeholder="https://twitter.com/..."
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Github className="w-4 h-4 inline mr-2" />
                      GitHub
                    </label>
                    <Input
                      value={formData.socialLinks.github}
                      onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)}
                      placeholder="https://github.com/..."
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Verification Documents
              </h2>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-400 mb-2">Verification Requirements</h3>
                    <p className="text-sm text-blue-300">
                      Please provide links to documents that verify your company's legitimacy.
                      These documents are kept confidential and are only used for verification purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business License
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.documents.businessLicense}
                      onChange={(e) => handleNestedChange('documents', 'businessLicense', e.target.value)}
                      placeholder="Link to document"
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cloud storage URL (Google Drive, Dropbox, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Certificate of Incorporation
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.documents.certificate}
                      onChange={(e) => handleNestedChange('documents', 'certificate', e.target.value)}
                      placeholder="Link to document"
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Official registration document
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tax Document
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.documents.taxDocument}
                      onChange={(e) => handleNestedChange('documents', 'taxDocument', e.target.value)}
                      placeholder="Link to document"
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tax registration or similar document
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any additional information that might help with verification..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-slate-700">
            <Button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              variant="outline"
              className="border-slate-600 hover:bg-slate-800"
            >
              Previous
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(step)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Verification Request'
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>

      {/* Benefits Section */}
      <Card className="p-6 mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">
          Benefits of Company Verification
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-1">Trust Badge</h4>
              <p className="text-sm text-slate-300">
                Display a verified badge on your company profile and job postings
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-1">Higher Visibility</h4>
              <p className="text-sm text-slate-300">
                Verified companies appear prominently in search results
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-white mb-1">More Applications</h4>
              <p className="text-sm text-slate-300">
                Candidates are 3x more likely to apply to verified companies
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}