'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw, Download } from 'lucide-react'
import { Button } from './button'
import { useServiceWorker } from '@/hooks/useServiceWorker'

export default function OfflineIndicator() {
  const { isOnline, isUpdateAvailable, updateServiceWorker } = useServiceWorker()
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdatePrompt(true)
    }
  }, [isUpdateAvailable])

  if (isOnline && !showUpdatePrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      {!isOnline && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-2 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-red-400" />
              <div>
                <p className="font-medium text-red-400">You're offline</p>
                <p className="text-sm text-red-300">Some features may not be available</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium text-green-400">Update available</p>
                <p className="text-sm text-green-300">A new version is ready to install</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUpdatePrompt(false)}
                className="text-green-400 hover:bg-green-500/10"
              >
                Later
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  updateServiceWorker()
                  setShowUpdatePrompt(false)
                }}
                className="bg-green-500 hover:bg-green-600"
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}

      {isOnline && !isUpdateAvailable && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">Connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}