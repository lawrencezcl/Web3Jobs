'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X, Settings } from 'lucide-react'
import { Button } from './button'
import { useServiceWorker } from '@/hooks/useServiceWorker'

export default function PushNotificationPrompt() {
  const { subscribeToNotifications, serviceWorkerRegistration } = useServiceWorker()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check current subscription status
    const checkSubscription = async () => {
      if (!serviceWorkerRegistration) return

      try {
        const subscription = await serviceWorkerRegistration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)

        // Show prompt for unsubscribed users after some time
        if (!subscription && typeof Notification !== 'undefined' && Notification.permission === 'default') {
          setTimeout(() => {
            setShowPrompt(true)
          }, 10000) // Show after 10 seconds
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      }
    }

    checkSubscription()
  }, [serviceWorkerRegistration])

  const handleSubscribe = async () => {
    if (!serviceWorkerRegistration) return

    setIsLoading(true)
    try {
      const subscription = await subscribeToNotifications()

      if (subscription) {
        setIsSubscribed(true)
        setShowPrompt(false)

        // Send subscription to server
        await sendSubscriptionToServer(subscription)
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!serviceWorkerRegistration) return

    setIsLoading(true)
    try {
      const subscription = await serviceWorkerRegistration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        setIsSubscribed(false)

        // Remove subscription from server
        await removeSubscriptionFromServer(subscription)
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          topics: ['all-jobs', 'saved-jobs-matches']
        })
      })
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription
        })
      })
    } catch (error) {
      console.error('Error removing subscription from server:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('push-notification-dismissed', 'true')
  }

  const handleLater = () => {
    setShowPrompt(false)
    // Ask again later
    setTimeout(() => {
      if (!isSubscribed && Notification.permission === 'default') {
        setShowPrompt(true)
      }
    }, 300000) // 5 minutes
  }

  useEffect(() => {
    // Check if user has already dismissed
    if (localStorage.getItem('push-notification-dismissed') === 'true') {
      setShowPrompt(false)
    }
  }, [])

  // Don't show if already subscribed, permission denied, or no service worker
  if (
    isSubscribed ||
    (typeof Notification !== 'undefined' && Notification.permission === 'denied') ||
    !serviceWorkerRegistration ||
    !showPrompt
  ) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 left-4 z-40 md:left-auto md:w-96">
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white mb-1">Stay Updated</h3>
            <p className="text-sm text-slate-300 mb-3">
              Get notified about new Web3 jobs that match your preferences, even when you're not browsing.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
              <Settings className="w-3 h-3" />
              <span>You can unsubscribe anytime</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time job alerts</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors p-1 self-end"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLater}
                disabled={isLoading}
                className="text-slate-400 hover:text-white px-3 py-1 text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}