'use client'

import { Button } from '@/components/ui/button'
import { Search, Filter, Home } from 'lucide-react'

interface TelegramWebApp {
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
  sendData: (data: string) => void
  openTelegramLink: (url: string) => void
  close: () => void
  ready: () => void
  expand: () => void
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
  }
}

interface MiniAppHeaderProps {
  telegram: TelegramWebApp | null
  onRefresh?: () => void
  refreshing?: boolean
  lastUpdated?: Date
}

export function MiniAppHeader({ telegram, onRefresh, refreshing, lastUpdated }: MiniAppHeaderProps) {
  const handleRefresh = () => {
    if (telegram && onRefresh) {
      telegram.HapticFeedback.impactOccurred('light')
      telegram.MainButton.showProgress(true)
      onRefresh()
      setTimeout(() => {
        telegram.MainButton.hideProgress()
        telegram.HapticFeedback.notificationOccurred('success')
      }, 2000)
    }
  }

  const handleClose = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('medium')
      telegram.close()
    }
  }

  const handleBack = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')
      if (telegram.BackButton.isVisible) {
        // Back button functionality
        window.history.back()
      }
    }
  }

  const handleContactBot = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')
      telegram.openTelegramLink('https://t.me/Web3job88bot')
    }
  }

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const user = telegram?.initDataUnsafe.user

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--tg-theme-button-color)' }}>
            <span className="text-white font-bold text-sm">W3</span>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--tg-theme-text-color)' }}>
              Web3 Jobs
            </h1>
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              {user ? `Welcome, ${user.first_name}!` : 'Find your next opportunity'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 relative"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleContactBot}
            className="p-2"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Last Updated & Quick Stats */}
      <div className="px-4 pb-3">
        {lastUpdated && (
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>
              Updated {formatLastUpdated(lastUpdated)}
            </p>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Live</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--tg-theme-bg-color)', border: '1px solid var(--tg-theme-hint-color)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--tg-theme-link-color)' }}>150+</div>
            <div className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Active Jobs</div>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--tg-theme-bg-color)', border: '1px solid var(--tg-theme-hint-color)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--tg-theme-link-color)' }}>80%</div>
            <div className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>Remote</div>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--tg-theme-bg-color)', border: '1px solid var(--tg-theme-hint-color)' }}>
            <div className="text-lg font-bold" style={{ color: 'var(--tg-theme-link-color)' }}>25+</div>
            <div className="text-xs" style={{ color: 'var(--tg-theme-hint-color)' }}>New/Week</div>
          </div>
        </div>
      </div>
    </header>
  )
}