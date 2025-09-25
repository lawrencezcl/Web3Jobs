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
  close: () => void
}

interface MiniAppHeaderProps {
  telegram: TelegramWebApp | null
}

export function MiniAppHeader({ telegram }: MiniAppHeaderProps) {
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

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W3</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Web3 Jobs
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Find your next opportunity
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <Search className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">150+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active Jobs</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">80%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Remote</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">25+</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">New/Week</div>
          </div>
        </div>
      </div>
    </header>
  )
}