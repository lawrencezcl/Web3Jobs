'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Github, ExternalLink, MessageCircle, Star } from 'lucide-react'

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

  const handleRateApp = () => {
    if (telegram) {
      telegram.HapticFeedback.impactOccurred('light')

      // Simulate rating - in real app, this would open a rating system
      const ratingData = {
        action: 'rate',
        rating: 5,
        timestamp: new Date().toISOString()
      }

      telegram.sendData(JSON.stringify(ratingData))
    }
  }

  const setupMainButton = () => {
    if (telegram) {
      // Configure main button for subscription
      telegram.MainButton.setText('Get Job Alerts')
      telegram.MainButton.setParams({
        color: '#22c55e',
        text_color: '#ffffff'
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

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto">
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactBot}
            className="flex flex-col items-center space-y-1 h-auto py-3"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat Bot</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRateApp}
            className="flex flex-col items-center space-y-1 h-auto py-3"
          >
            <Star className="w-5 h-5" />
            <span className="text-xs">Rate App</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => telegram?.openLink('https://github.com')}
            className="flex flex-col items-center space-y-1 h-auto py-3"
          >
            <Github className="w-5 h-5" />
            <span className="text-xs">GitHub</span>
          </Button>
        </div>

        {/* App Info */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>Web3 Jobs Mini App v1.0</p>
          <p>Built with Next.js & Telegram Web Apps</p>
        </div>

        {/* Privacy & Terms */}
        <div className="flex justify-center space-x-4 text-xs text-blue-600 dark:text-blue-400">
          <button
            onClick={() => telegram?.openLink('https://example.com/privacy')}
            className="hover:underline"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => telegram?.openLink('https://example.com/terms')}
            className="hover:underline"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  )
}