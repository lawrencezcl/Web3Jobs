import './globals.css'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Web3 Jobs | Remote Blockchain Developer Careers 2024',
  description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs. Remote opportunities at leading crypto companies including smart contract developer, blockchain engineer, DeFi analyst positions.',
  keywords: [
    'web3 jobs', 'blockchain jobs', 'cryptocurrency jobs', 'defi jobs', 'remote blockchain developer',
    'smart contract developer', 'blockchain engineer', 'crypto jobs', 'ethereum developer',
    'solidity developer', 'web3 careers', 'blockchain careers', 'crypto careers',
    'remote crypto jobs', 'decentralized finance jobs', 'NFT jobs', 'DAO jobs',
    'layer 2 jobs', 'polygon jobs', 'avalanche jobs', 'chainlink jobs', 'uniswap jobs',
    'web3 remote work', 'blockchain startup jobs', 'crypto developer positions',
    'bitcoin jobs', 'ethereum jobs', 'web3 frontend developer', 'web3 backend developer'
  ],
  authors: [{ name: 'Web3 Jobs Platform' }],
  creator: 'Web3 Jobs Platform',
  publisher: 'Web3 Jobs Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.richidea.top'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'de-DE': '/de-DE',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.richidea.top',
    title: 'Web3 Jobs | Remote Blockchain Developer Careers 2024',
    description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs. Remote opportunities at leading crypto companies.',
    siteName: 'Web3 Jobs Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Jobs Platform - Find Your Dream Blockchain Career',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Jobs | Remote Blockchain Developer Careers 2024',
    description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs. Remote opportunities at leading crypto companies.',
    creator: '@web3jobsplatform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false, // Change from true to false for better SEO
    googleBot: {
      index: true,
      follow: true, // Change from false to true for better SEO
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://www.richidea.top" />
        <link rel="preload" href="/og-image.png" as="image" type="image/png" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Web3 Jobs Platform",
              "url": "https://www.richidea.top",
              "description": "Find the best Web3, blockchain, cryptocurrency & DeFi jobs",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.richidea.top/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-inter antialiased">
        <div className="min-h-screen">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
