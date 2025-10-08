'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone, Monitor } from 'lucide-react'
import { Button } from './button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isInWebAppiOS)
    }

    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay (only if not already installed)
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true)
        }
      }, 5000)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
      }

      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error during installation prompt:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  useEffect(() => {
    // Check if user has already dismissed in this session
    if (sessionStorage.getItem('pwa-install-dismissed') === 'true') {
      setShowInstallPrompt(false)
    }
  }, [])

  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroid = /Android/.test(navigator.userAgent)

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">Install Web3 Jobs</h3>
            <p className="text-sm text-slate-300 mb-3">
              Install our app for the best experience with offline support and push notifications.
            </p>

            {isIOS && (
              <div className="text-xs text-slate-400 mb-3 p-2 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-3 h-3" />
                  <span className="font-medium">iOS Installation:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap the Share button <span className="font-mono bg-slate-700 px-1 rounded">⎙</span></li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to install the app</li>
                </ol>
              </div>
            )}

            {!isIOS && (
              <div className="text-xs text-slate-400 mb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3 h-3" />
                  <span>Get native app experience with one-click install</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {!isIOS && (
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
              >
                Install
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}