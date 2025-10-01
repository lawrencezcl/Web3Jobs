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
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Initialize Telegram Web App with enhanced features
  useEffect(() => {
    const initTelegram = () => {
      try {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp
          setTelegram(webApp)

          // Set theme
          setTheme(webApp.colorScheme)

          // Apply theme colors with CSS variables
          const root = document.documentElement
          root.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '#ffffff')
          root.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '#000000')
          root.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color || '#999999')
          root.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color || '#3390ec')
          root.style.setProperty('--tg-theme-button-color', webApp.themeParams.button_color || '#22c55e')
          root.style.setProperty('--tg-theme-button-text-color', webApp.themeParams.button_text_color || '#ffffff')

          // Enable expanded mode and web app features
          webApp.expand()

          // Set header color to match theme
          if (webApp.headerColor !== undefined) {
            webApp.headerColor = webApp.themeParams.bg_color || '#ffffff'
          }

          // Setup Main Button for search functionality
          webApp.MainButton.setText('Search Jobs')
          webApp.MainButton.setParams({
            color: webApp.themeParams.button_color || '#22c55e',
            text_color: webApp.themeParams.button_text_color || '#ffffff'
          })
          webApp.MainButton.onClick(() => {
            webApp.HapticFeedback.impactOccurred('medium')
            // Focus search input
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
              searchInput.scrollIntoView({ behavior: 'smooth' })
            }
          })
          webApp.MainButton.show()
          webApp.MainButton.enable()

          // Setup Back Button
          webApp.BackButton.onClick(() => {
            webApp.HapticFeedback.impactOccurred('light')
            window.history.back()
          })

          // Handle viewport changes
          webApp.onEvent('viewportChanged', () => {
            // Adjust layout based on new viewport
            document.body.style.minHeight = `${webApp.viewportHeight}px`
          })

          // Handle theme changes
          webApp.onEvent('themeChanged', () => {
            setTheme(webApp.colorScheme)
            // Reapply theme colors
            root.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '#ffffff')
            root.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '#000000')
            root.style.setProperty('--tg-theme-hint-color', webApp.themeParams.hint_color || '#999999')
            root.style.setProperty('--tg-theme-link-color', webApp.themeParams.link_color || '#3390ec')
          })

          // Get user data for personalization
          if (webApp.initDataUnsafe.user) {
            const user = webApp.initDataUnsafe.user
            console.log('Telegram User:', user)
            // You can use user data for personalization
          }

          // Notify Telegram that the app is ready
          webApp.ready()

          
          // Initial viewport setup
          document.body.style.minHeight = `${webApp.viewportHeight}px`
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
      // Cleanup Telegram Web App listeners
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp
        webApp.offEvent('viewportChanged', () => {})
        webApp.offEvent('themeChanged', () => {})
      }
    }
  }, [])

  // Fetch real job data from API
  const fetchRealJobs = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/jobs?limit=20&remote=true', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          // Transform API data to match Mini App format
          const transformedJobs = data.items.map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location || 'Remote',
            remote: job.remote,
            salary: job.salary || 'Competitive',
            employmentType: job.seniorityLevel || 'Full-time',
            postedAt: job.postedAt || job.createdAt,
            url: job.url,
            applyUrl: job.url,
            detailUrl: `/mini-app/jobs/${job.id}`,
            tags: (job.tags || '').split(',').filter(Boolean).map((tag: string) => tag.trim()),
            description: job.description || 'Exciting opportunity in the Web3 space.'
          }))
          setJobs(transformedJobs)
          setLastUpdated(new Date())

          // Show success feedback
          if (telegram) {
            telegram.HapticFeedback.notificationOccurred('success')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching real jobs:', error)
      // Keep sample data if API fails
      if (telegram) {
        telegram.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setRefreshing(false)
    }
  }, [telegram])

  // Fetch real jobs on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRealJobs()
    }, 1000) // Delay for smoother UX

    return () => clearTimeout(timer)
  }, [fetchRealJobs])

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
      telegram.HapticFeedback.impactOccurred('light')

      const shareText = `🚀 ${job.title}\n🏢 ${job.company}\n💰 ${job.salary}\n📍 ${job.location}\n\n${job.description.substring(0, 150)}...\n\n🔗 Apply: ${job.url}\n\n📱 Found via @Web3job88bot Mini App`

      // Send share data back to bot
      const shareData = {
        action: 'share_job',
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          url: job.url
        },
        timestamp: new Date().toISOString()
      }

      try {
        telegram.sendData(JSON.stringify(shareData))
      } catch (error) {
        console.log('Could not send data to bot, using fallback')
      }

      // Try to use Telegram's native sharing (WebApp 6.4+)
      if (telegram.shareURL) {
        try {
          telegram.shareURL(job.url, shareText)
          return
        } catch (error) {
          console.log('shareURL not available, using clipboard')
        }
      }

      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        telegram.HapticFeedback.notificationOccurred('success')
        // Show success message in a Telegram-like style
        showTelegramNotification('✅ Job details copied to clipboard!')
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = shareText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showTelegramNotification('✅ Job details copied to clipboard!')
      })
    }
  }

  const showTelegramNotification = (message: string) => {
    // Create a Telegram-style notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm'
    notification.textContent = message
    notification.style.cssText = 'animation: slideDown 0.3s ease-out;'

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.cssText = 'animation: slideUp 0.3s ease-in;'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 2000)
  }

  const handleSubscribeToAlerts = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('medium')

      const subscriptionData = {
        action: 'subscribe_alerts',
        filters: {
          tags: selectedTags,
          remoteOnly: remoteOnly,
          searchQuery: searchQuery
        },
        timestamp: new Date().toISOString()
      }

      try {
        telegram.sendData(JSON.stringify(subscriptionData))
        showTelegramNotification('✅ Subscribed to job alerts!')
      } catch (error) {
        showTelegramNotification('✅ Subscription preferences saved!')
      }
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
          <MiniAppHeader
            telegram={telegram}
            onRefresh={fetchRealJobs}
            refreshing={refreshing}
            lastUpdated={lastUpdated}
          />

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