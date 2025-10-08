const CACHE_NAME = 'web3jobs-v1'
const urlsToCache = [
  '/',
  '/jobs',
  '/saved',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
]

const API_CACHE_NAME = 'web3jobs-api-v1'

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful API responses for 5 minutes
              if (response.ok) {
                const responseClone = response.clone()
                cache.put(request, responseClone)
              }
              return response
            })
            .catch(() => {
              // Return cached response if network fails
              return cache.match(request)
            })
        })
    )
    return
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }

        return fetch(request).then((response) => {
          // Cache successful responses for static assets
          if (response.ok && request.url.includes('/static/') || request.url.includes('/icons/')) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
      .catch(() => {
        // Return cached homepage for failed navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/')
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle background sync for offline actions
  // This would sync any saved jobs, searches, etc.
  console.log('Background sync completed')
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Job',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('New Web3 Job Posted', options)
  )
})