'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true)
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setServiceWorkerRegistration(registration)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true)
              }
            })
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateServiceWorker = () => {
    if (serviceWorkerRegistration) {
      serviceWorkerRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const subscribeToNotifications = async () => {
    if (!serviceWorkerRegistration) return null

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        return null
      }

      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error)
      return null
    }
  }

  return {
    isOnline,
    isUpdateAvailable,
    updateServiceWorker,
    subscribeToNotifications,
    serviceWorkerRegistration
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}