import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Web3 Jobs Platform - Blockchain Careers',
    short_name: 'Web3 Jobs',
    description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs. Remote opportunities at leading crypto companies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '375x812',
        type: 'image/png'
      },
      {
        src: '/screenshot-desktop.png',
        sizes: '1200x800',
        type: 'image/png'
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  }
}