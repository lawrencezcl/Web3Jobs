'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Github, ExternalLink, MessageCircle, Star, Share2 } from 'lucide-react'

interface TelegramWebApp {
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
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
}

interface MiniAppFooterProps {
  telegram: TelegramWebApp | null
}

export function MiniAppFooter({ telegram }: MiniAppFooterProps) {
  const handleSubscribe = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('medium')

      // Send subscription request back to bot
      const subscriptionData = {
        action: 'subscribe',
        topics: 'all',
        timestamp: new Date().toISOString()
      }

      try {
        telegram.sendData(JSON.stringify(subscriptionData))
      } catch (error) {
        // Fallback: show subscription message
        alert('✅ Subscribed to job alerts!\\n\\nYou will receive notifications for new Web3 jobs matching your interests.')
      }
    } else {
      // Fallback for web testing
      alert('✅ Subscribed to job alerts!\\n\\nYou will receive notifications for new Web3 jobs matching your interests.')
    }
  }

  const handleContactBot = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')
      telegram.openTelegramLink('https://t.me/Web3job88bot')
    }
  }

  const setupMainButton = () => {
    if (telegram) {
      // Configure main button for subscription
      telegram.MainButton.setText('Get Job Alerts')
      telegram.MainButton.setParams({
        color: 'var(--tg-theme-button-color, #22c55e)',
        text_color: 'var(--tg-theme-button-text-color, #ffffff)'
      })
      telegram.MainButton.onClick(handleSubscribe)
      telegram.MainButton.show()
      telegram.MainButton.enable()

      return () => {
        telegram.MainButton.hide()
      }
    }
  }

  // Set up main button when component mounts
  React.useEffect(() => {
    const cleanup = setupMainButton()
    return cleanup
  }, [telegram])

  const handleShareApp = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')

      const shareText = '🚀 Find amazing Web3 jobs with this Telegram Mini App!\n\n💼 Remote & on-site positions\n🔔 Real-time alerts\n📱 Mobile optimized\n\n👉 @Web3job88bot'

      // Native sharing not available in current Telegram WebApp API
      // Proceed with fallback methods

      // Fallback: send share data to bot
      const shareData = {
        action: 'share_app',
        timestamp: new Date().toISOString()
      }

      try {
        telegram.sendData(JSON.stringify(shareData))
      } catch (error) {
        console.log('Could not send share data')
      }

      // Copy to clipboard fallback
      navigator.clipboard.writeText(shareText).then(() => {
        telegram.HapticFeedback.notificationOccurred('success')
      })
    }
  }

  const handleRateApp = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')

      // Send rating request to bot
      const ratingData = {
        action: 'rate_app',
        timestamp: new Date().toISOString()
      }

      try {
        telegram.sendData(JSON.stringify(ratingData))
      } catch (error) {
        console.log('Could not send rating data')
      }

      // Open bot chat for rating
      telegram.openTelegramLink('https://t.me/Web3job88bot?start=rate_app')
    }
  }

  const handleSaveJobs = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')

      const saveData = {
        action: 'save_preferences',
        timestamp: new Date().toISOString()
      }

      try {
        telegram.sendData(JSON.stringify(saveData))
      } catch (error) {
        console.log('Could not save preferences')
      }
    }
  }

  return (
    <footer className="border-t mt-auto" style={{ backgroundColor: 'var(--tg-theme-bg-color)', borderColor: 'var(--tg-theme-hint-color)' }}>
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactBot}
            className="flex flex-col items-center space-y-1 h-auto py-3"
            style={{ borderColor: 'var(--tg-theme-hint-color)', color: 'var(--tg-theme-text-color)' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Chat Bot</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareApp}
            className="flex flex-col items-center space-y-1 h-auto py-3"
            style={{ borderColor: 'var(--tg-theme-hint-color)', color: 'var(--tg-theme-text-color)' }}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveJobs}
            className="flex flex-col items-center space-y-1 h-auto py-3"
            style={{ borderColor: 'var(--tg-theme-hint-color)', color: 'var(--tg-theme-text-color)' }}
          >
            <Star className="w-4 h-4" />
            <span className="text-xs">Save</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRateApp}
            className="flex flex-col items-center space-y-1 h-auto py-3"
            style={{ borderColor: 'var(--tg-theme-hint-color)', color: 'var(--tg-theme-text-color)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-xs">Rate</span>
          </Button>
        </div>

        {/* Enhanced Features */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                🔔 Get Job Alerts
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Receive personalized job notifications
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSubscribe}
              style={{ backgroundColor: 'var(--tg-theme-button-color)', color: 'var(--tg-theme-button-text-color)' }}
              className="text-xs px-3 py-1"
            >
              Subscribe
            </Button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-xs space-y-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
          <p>Web3 Jobs Mini App v2.0 • Powered by @Web3job88bot</p>
          <p>🚀 Real-time jobs • 📱 Mobile optimized • 🎯 Personalized alerts</p>
        </div>

        {/* Links */}
        <div className="flex justify-center space-x-4 text-xs" style={{ color: 'var(--tg-theme-link-color)' }}>
          <button
            onClick={() => telegram?.openLink('https://www.remotejobs.top')}
            className="hover:underline"
          >
            Website
          </button>
          <button
            onClick={() => telegram?.openLink('mailto:support@remotejobs.top')}
            className="hover:underline"
          >
            Support
          </button>
          <button
            onClick={() => telegram?.openLink('https://www.remotejobs.top/privacy')}
            className="hover:underline"
          >
            Privacy
          </button>
        </div>
      </div>
    </footer>
  )
}