'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MiniAppHeader } from '@/components/mini-app/mini-app-header'
import { JobSearch } from '@/components/mini-app/job-search'
import { JobList } from '@/components/mini-app/job-list'
import { JobFilters } from '@/components/mini-app/job-filters'
import { MiniAppFooter } from '@/components/mini-app/mini-app-footer'

// Sample jobs data for Mini App with real application URLs
const sampleJobs = [
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
    description: 'Looking for senior blockchain developer with Solidity experience. You will be responsible for developing and deploying smart contracts, working with DeFi protocols, and building scalable blockchain solutions. Experience with Ethereum, Solidity, and Web3.js required.'
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
    description: 'Smart contract auditor needed for DeFi protocol security audits. We are looking for experienced auditors to review smart contracts for security vulnerabilities, optimize gas usage, and ensure compliance with industry standards.'
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
    description: 'Frontend developer with React and Web3 integration experience. Join our team to build cutting-edge Web3 applications with modern React patterns, wallet integration, and blockchain connectivity.'
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
    description: 'Experienced DeFi developer for yield optimization protocols. Help us build the next generation of DeFi products focusing on yield farming, liquidity mining, and automated market makers.'
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
    description: 'Build scalable NFT marketplace and minting platform. We are looking for engineers passionate about NFTs, digital art, and blockchain technology to help shape the future of digital ownership.'
  }
]

// Telegram Web App types
interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    receiver?: {
      id: number
    }
    chat?: {
      id: number
      type: string
      title: string
      username?: string
    }
    start_param?: string
    chat_type?: string
    chat_instance?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  isClosingConfirmationEnabled: boolean
  headerColor?: string
  backgroundColor?: string
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
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  onEvent: (eventType: string, callback: () => void) => void
  offEvent: (eventType: string, callback: () => void) => void
  sendData: (data: string) => void
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  openInvoice: (url: string, callback: (status: string) => void) => void
  close: () => void
  ready: () => void
  expand: () => void
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp
    }
  }
}

export default function MiniAppPage() {
  const router = useRouter()
  const [telegram, setTelegram] = useState<TelegramWebApp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [jobs, setJobs] = useState(sampleJobs)
  const [filteredJobs, setFilteredJobs] = useState(sampleJobs)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Initialize Telegram Web App
  useEffect(() => {
    const initTelegram = () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp
          setTelegram(webApp)

          // Set theme
          setTheme(webApp.colorScheme)

          // Apply theme colors
          document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '#ffffff')
          document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '#000000')
          document.documentElement.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color || '#999999')
          document.documentElement.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color || '#3390ec')

          // Expand the app
          webApp.expand()

          // Notify Telegram that the app is ready
          webApp.ready()
        }
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize immediately
    initTelegram()

    // Also initialize on window load
    if (typeof window !== 'undefined') {
      window.addEventListener('load', initTelegram)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', initTelegram)
      }
    }
  }, [])

  // Get all available tags
  const allTags = Array.from(new Set(jobs.flatMap(job => job.tags)))

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      )
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(job =>
        selectedTags.some(tag => job.tags.includes(tag))
      )
    }

    // Apply remote filter
    if (remoteOnly) {
      filtered = filtered.filter(job => job.remote)
    }

    setFilteredJobs(filtered)
  }, [jobs, searchQuery, selectedTags, remoteOnly])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleJobApply = (jobUrl: string) => {
    if (telegram) {
      telegram.openLink(jobUrl)
    } else {
      window.open(jobUrl, '_blank')
    }
  }

  const handleShareJob = (job: any) => {
    if (telegram) {
      const shareText = `🚀 ${job.title} at ${job.company}\n\n💰 ${job.salary}\n📍 ${job.location}\n\n${job.description.substring(0, 100)}...\n\n🔗 ${job.url}`

      // Fallback: copy to clipboard since shareText is not available
      navigator.clipboard.writeText(shareText).then(() => {
        if (telegram.HapticFeedback) {
          telegram.HapticFeedback.notificationOccurred('success')
        }
        alert('Job details copied to clipboard!')
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Job details copied to clipboard!')
      })
    }
  }

  const handleViewDetails = (job: any) => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')
    }

    // Navigate to job detail page
    router.push(`/mini-app/jobs/${job.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Web3 Jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="max-w-md mx-auto min-h-screen">
          <MiniAppHeader telegram={telegram} />

          <div className="p-4">
            <JobSearch
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />

            <JobFilters
              tags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              remoteOnly={remoteOnly}
              onRemoteToggle={() => setRemoteOnly(!remoteOnly)}
            />

            <JobList
              jobs={filteredJobs}
              onApply={handleJobApply}
              onShare={handleShareJob}
              onViewDetails={handleViewDetails}
              telegram={telegram}
            />

            {filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </div>

          <MiniAppFooter telegram={telegram} />
        </div>
      </div>
    </div>
  )
}