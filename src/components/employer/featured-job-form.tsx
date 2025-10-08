'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Star,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Plus,
  X,
  CreditCard,
} from 'lucide-react'

interface FeaturedJobFormProps {
  onSubmitSuccess?: (data: any) => void
  initialData?: Partial<JobFormData>
}

interface JobFormData {
  title: string
  company: string
  location: string
  remote: boolean
  tags: string[]
  url: string
  description: string
  salary: string
  salaryMin: number
  salaryMax: number
  currency: string
  employmentType: string
  seniorityLevel: string
  applicationDeadline: string
  featuredTier: 'basic' | 'premium' | 'enterprise'
  highlights: string[]
  requirements: string[]
  benefits: string[]
}

const PRICING_TIERS = {
  basic: {
    name: 'Basic',
    price: 199,
    duration: 30,
    features: [
      'Featured listing for 30 days',
      'Priority placement in search',
      'Company logo display',
      'Basic analytics',
    ],
    icon: Star,
    color: 'from-blue-500 to-blue-600',
  },
  premium: {
    name: 'Premium',
    price: 499,
    duration: 60,
    features: [
      'Enhanced featured listing for 60 days',
      'Top placement in search results',
      'Social media promotion',
      'Advanced analytics dashboard',
      'Company profile highlighting',
    ],
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    duration: 90,
    features: [
      'Premium placement for 90 days',
      'Dedicated account support',
      'Full analytics suite',
      'Unlimited job edits',
      'Priority customer support',
      'Custom branding options',
    ],
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
  },
}

const EMPLOYMENT_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship',
]

const EXPERIENCE_LEVELS = [
  'Entry Level', 'Mid Level', 'Senior Level', 'Lead/Principal', 'Executive',
]

const POPULAR_TAGS = [
  'Solidity', 'React', 'TypeScript', 'Node.js', 'Web3', 'DeFi',
  'Smart Contracts', 'NFT', 'Blockchain', 'Rust', 'Ethereum',
]

export default function FeaturedJobForm({ onSubmitSuccess, initialData }: FeaturedJobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    remote: true,
    tags: [],
    url: '',
    description: '',
    salary: '',
    salaryMin: 0,
    salaryMax: 0,
    currency: 'USD',
    employmentType: '',
    seniorityLevel: '',
    applicationDeadline: '',
    featuredTier: 'basic',
    highlights: [],
    requirements: [],
    benefits: [],
    ...initialData,
  })

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'enterprise'>('basic')

  const totalSteps = 3

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const addArrayItem = (field: 'highlights' | 'requirements' | 'benefits', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }))
    }
  }

  const removeArrayItem = (field: 'highlights' | 'requirements' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.company && formData.description)
      case 2:
        return !!(formData.employmentType && formData.seniorityLevel)
      case 3:
        return true // Payment step is handled separately
      default:
        return false
    }
  }

  const handleSubmit = async (isPaymentStep: boolean = false) => {
    if (!validateStep(step) && !isPaymentStep) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/jobs/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          featuredTier: selectedTier,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSubmitSuccess?.(data)
      } else {
        setError(data.error || 'Failed to create featured job posting')
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

  const handleTierSelect = (tier: 'basic' | 'premium' | 'enterprise') => {
    setSelectedTier(tier)
    handleInputChange('featuredTier', tier)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Post a Featured Job
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Get maximum visibility for your job posting with our featured job promotion
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
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
                  stepNumber
                )}
              </div>
              {stepNumber < totalSteps && (
                <div
                  className={`w-16 h-0.5 mx-2 transition-colors ${
                    step > stepNumber ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-sm">
          <span className={step >= 1 ? 'text-white' : 'text-slate-500'}>Job Details</span>
          <span className={step >= 2 ? 'text-white' : 'text-slate-500'}>Requirements</span>
          <span className={step >= 3 ? 'text-white' : 'text-slate-500'}>Pricing</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Basic Job Information */}
      {step === 1 && (
        <Card className="p-8 bg-slate-900/50 border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6">Job Information</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Senior Solidity Developer"
                  className="bg-slate-800 border-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Acme Blockchain"
                  className="bg-slate-800 border-slate-600"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="pl-10 bg-slate-800 border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Application URL *
                </label>
                <Input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://company.com/careers/job-123"
                  className="bg-slate-800 border-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Job Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={6}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-blue-500/30 flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-blue-100">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.filter(tag => !formData.tags.includes(tag)).map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-3 py-1 text-xs bg-slate-800 text-slate-300 border border-slate-600 rounded-full hover:bg-slate-700"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remote"
                checked={formData.remote}
                onChange={(e) => handleInputChange('remote', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 rounded"
              />
              <label htmlFor="remote" className="text-sm font-medium text-slate-300">
                This is a remote position
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <div></div>
            <Button onClick={nextStep} disabled={!validateStep(1)}>
              Next Step
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Additional Details */}
      {step === 2 && (
        <Card className="p-8 bg-slate-900/50 border-slate-700">
          <h2 className="text-2xl font-semibold text-white mb-6">Additional Details</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Employment Type *
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Experience Level *
                </label>
                <select
                  value={formData.seniorityLevel}
                  onChange={(e) => handleInputChange('seniorityLevel', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  required
                >
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Salary Range
              </label>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  placeholder="Min"
                  value={formData.salaryMin || ''}
                  onChange={(e) => handleInputChange('salaryMin', parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-600"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={formData.salaryMax || ''}
                  onChange={(e) => handleInputChange('salaryMax', parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-600"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Application Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-600"
                />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Job Highlights
              </label>
              <div className="space-y-2">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={highlight}
                      onChange={(e) => {
                        const newHighlights = [...formData.highlights]
                        newHighlights[index] = e.target.value
                        handleInputChange('highlights', newHighlights)
                      }}
                      className="bg-slate-800 border-slate-600"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('highlights', index)}
                      className="border-slate-600 hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a highlight..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('highlights', (e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                    className="bg-slate-800 border-slate-600"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input')
                      if (input) {
                        addArrayItem('highlights', input.value)
                        input.value = ''
                      }
                    }}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} className="border-slate-600 hover:bg-slate-800">
              Previous
            </Button>
            <Button onClick={nextStep} disabled={!validateStep(2)}>
              Next Step
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Pricing and Payment */}
      {step === 3 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-white text-center">Choose Your Featured Plan</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(PRICING_TIERS).map(([tierKey, tier]) => {
              const Icon = tier.icon
              const isSelected = selectedTier === tierKey

              return (
                <Card
                  key={tierKey}
                  className={`p-6 bg-slate-900/50 border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => handleTierSelect(tierKey as 'basic' | 'premium' | 'enterprise')}
                >
                  <div className={`text-center mb-4`}>
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-white">${tier.price}</span>
                      <span className="text-slate-400">/{tier.duration} days</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      isSelected
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </Card>
              )
            })}
          </div>

          <Card className="p-6 bg-slate-900/50 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Job Title:</span>
                <span className="text-white">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Company:</span>
                <span className="text-white">{formData.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Featured Plan:</span>
                <span className="text-white capitalize">{selectedTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Duration:</span>
                <span className="text-white">{PRICING_TIERS[selectedTier].duration} days</span>
              </div>
              <div className="border-t border-slate-700 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-blue-400">${PRICING_TIERS[selectedTier].price}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep} className="border-slate-600 hover:bg-slate-800">
              Previous
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Proceed to Payment (${PRICING_TIERS[selectedTier].price})
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}