'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MiniAppHeader } from '@/components/mini-app/mini-app-header'
import { MiniAppFooter } from '@/components/mini-app/mini-app-footer'
import {
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Share2,
  Building,
  Clock,
  ArrowLeft,
  Users,
  Briefcase,
  Star
} from 'lucide-react'

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
  applyUrl: string
  detailUrl: string
  tags: string[]
  description: string
}

// Sample jobs data (same as main page)
const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Blockchain Developer',
    company: 'CryptoTech Inc',
    location: 'Remote',
    remote: true,
    salary: '$120k - $180k',
    employmentType: 'Full-time',
    postedAt: new Date().toISOString(),
    url: 'https://web3.career/senior-blockchain-developer-cryptotech-inc',
    applyUrl: 'https://web3.career/senior-blockchain-developer-cryptotech-inc/apply',
    detailUrl: '/mini-app/jobs/1',
    tags: ['blockchain', 'solidity', 'web3'],
    description: 'Looking for senior blockchain developer with Solidity experience. You will be responsible for developing and deploying smart contracts, working with DeFi protocols, and building scalable blockchain solutions. Experience with Ethereum, Solidity, and Web3.js required. This is a fully remote position with competitive salary and benefits.'
  },
  {
    id: '2',
    title: 'Smart Contract Auditor',
    company: 'DeFi Security',
    location: 'Remote',
    remote: true,
    salary: '$100k - $150k',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    url: 'https://web3.career/smart-contract-auditor-defi-security',
    applyUrl: 'https://web3.career/smart-contract-auditor-defi-security/apply',
    detailUrl: '/mini-app/jobs/2',
    tags: ['smart-contracts', 'auditing', 'security'],
    description: 'Smart contract auditor needed for DeFi protocol security audits. We are looking for experienced auditors to review smart contracts for security vulnerabilities, optimize gas usage, and ensure compliance with industry standards. Strong understanding of DeFi protocols and security best practices required.'
  },
  {
    id: '3',
    title: 'Web3 Frontend Developer',
    company: 'MetaWeb Studios',
    location: 'San Francisco',
    remote: false,
    salary: '$90k - $130k',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 172800000).toISOString(),
    url: 'https://web3.career/web3-frontend-developer-metaweb-studios',
    applyUrl: 'https://web3.career/web3-frontend-developer-metaweb-studios/apply',
    detailUrl: '/mini-app/jobs/3',
    tags: ['react', 'typescript', 'web3'],
    description: 'Frontend developer with React and Web3 integration experience. Join our team to build cutting-edge Web3 applications with modern React patterns, wallet integration, and blockchain connectivity. Experience with MetaMask, Web3.js, and DeFi protocols preferred.'
  },
  {
    id: '4',
    title: 'DeFi Protocol Developer',
    company: 'YieldMax',
    location: 'Remote',
    remote: true,
    salary: '$130k - $200k',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 259200000).toISOString(),
    url: 'https://web3.career/defi-protocol-developer-yieldmax',
    applyUrl: 'https://web3.career/defi-protocol-developer-yieldmax/apply',
    detailUrl: '/mini-app/jobs/4',
    tags: ['defi', 'solidity', 'yield-farming'],
    description: 'Experienced DeFi developer for yield optimization protocols. Help us build the next generation of DeFi products focusing on yield farming, liquidity mining, and automated market makers. Deep knowledge of DeFi protocols and smart contract development required.'
  },
  {
    id: '5',
    title: 'NFT Platform Engineer',
    company: 'NFTify',
    location: 'New York',
    remote: true,
    salary: '$110k - $160k',
    employmentType: 'Full-time',
    postedAt: new Date(Date.now() - 345600000).toISOString(),
    url: 'https://web3.career/nft-platform-engineer-nftify',
    applyUrl: 'https://web3.career/nft-platform-engineer-nftify/apply',
    detailUrl: '/mini-app/jobs/5',
    tags: ['nft', 'react', 'blockchain'],
    description: 'Build scalable NFT marketplace and minting platform. We are looking for engineers passionate about NFTs, digital art, and blockchain technology to help shape the future of digital ownership. Experience with IPFS, ERC-721, and marketplace development essential.'
  }
]

// Telegram Web App interface (matching main page)
interface TelegramWebApp {
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  openLink: (url: string) => void
  close: () => void
  ready: () => void
  expand: () => void
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    onClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive: boolean) => void
    hideProgress: () => void
    setText: (text: string) => void
    setParams: (params: { text?: string; color?: string; text_color?: string }) => void
  }
  sendData: (data: string) => void
  openTelegramLink: (url: string) => void
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  openInvoice: (url: string, callback: (status: string) => void) => void
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null)

  const jobId = params.id as string

  useEffect(() => {
    // Initialize Telegram Web App with enhanced features
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp
        setTelegram(webApp)
        webApp.ready()
        webApp.expand()

        // Enable closing confirmation
        webApp.enableClosingConfirmation()

        // Setup Main Button for apply action
        webApp.MainButton.setText('Apply Now')
        webApp.MainButton.setParams({
          color: webApp.themeParams.button_color || '#22c55e',
          text_color: webApp.themeParams.button_text_color || '#ffffff'
        })
        webApp.MainButton.onClick(() => {
          webApp.HapticFeedback.impactOccurred('medium')
          const jobUrl = job?.applyUrl || job?.url
          if (jobUrl) {
            webApp.openLink(jobUrl)
          }
        })
        webApp.MainButton.show()
        webApp.MainButton.enable()

        // Setup Back Button
        webApp.BackButton.onClick(() => {
          webApp.HapticFeedback.impactOccurred('light')
          router.back()
        })
        webApp.BackButton.show()

        // Cleanup on unmount
        return () => {
          webApp.MainButton.hide()
          webApp.BackButton.hide()
        }
      }
    } catch (error) {
      console.error('Error initializing Telegram Web App:', error)
    }

    // Find job by ID (try real API first)
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (response.ok) {
          const jobData = await response.json()
          setJob(jobData)
        } else {
          // Fallback to sample data
          const foundJob = sampleJobs.find(j => j.id === jobId)
          setJob(foundJob || null)
        }
      } catch (error) {
        console.error('Error fetching job details:', error)
        // Fallback to sample data
        const foundJob = sampleJobs.find(j => j.id === jobId)
        setJob(foundJob || null)
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId, router, job?.applyUrl, job?.url])

  const handleApply = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('medium')
      telegram.openLink(job?.applyUrl || job?.url || '#')
    } else {
      window.open(job?.applyUrl || job?.url || '#', '_blank')
    }
  }

  const handleShare = () => {
    if (job && telegram) {
      telegram.HapticFeedback.impactOccurred('light')

      const shareText = `🚀 ${job.title} at ${job.company}\n\n💰 ${job.salary}\n📍 ${job.location}\n\n${job.description.substring(0, 100)}...\n\n🔗 ${job.url}`

      navigator.clipboard.writeText(shareText).then(() => {
        telegram.HapticFeedback.notificationOccurred('success')
        alert('Job details copied to clipboard!')
      }).catch(() => {
        alert('Job details copied to clipboard!')
      })
    }
  }

  const handleGoBack = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')
    }
    router.back()
  }

  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (diffInDays === 0) {
        return 'Today'
      } else if (diffInDays === 1) {
        return 'Yesterday'
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`
      } else {
        return `${Math.floor(diffInDays / 7)} weeks ago`
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto min-h-screen">
          <MiniAppHeader telegram={telegram} />

          <div className="p-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Job not found</h3>
              <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
              <Button onClick={handleGoBack} className="bg-blue-600 hover:bg-blue-700 text-white">
                Go Back
              </Button>
            </div>
          </div>

          <MiniAppFooter telegram={telegram} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen">
        <MiniAppHeader telegram={telegram} />

        <div className="p-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jobs</span>
          </Button>

          {/* Job Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {job.remote ? 'Remote' : job.location}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {job.salary}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {getRelativeTime(job.postedAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employmentType)}`}>
                  {job.employmentType}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Job Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleApply}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="px-4 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Similar Jobs Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Similar Jobs
            </h3>
            <div className="space-y-3">
              {sampleJobs
                .filter(j => j.id !== job.id && j.tags.some(tag => job.tags.includes(tag)))
                .slice(0, 3)
                .map((similarJob) => (
                  <div
                    key={similarJob.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      if (telegram) {
                        telegram.HapticFeedback.impactOccurred('light')
                      }
                      router.push(`/mini-app/jobs/${similarJob.id}`)
                    }}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {similarJob.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Building className="w-3 h-3" />
                      <span>{similarJob.company}</span>
                      <span>•</span>
                      <span>{similarJob.salary}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <MiniAppFooter telegram={telegram} />
      </div>
    </div>
  )
}