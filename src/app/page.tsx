import ModernHomepage from '../components/modern-homepage'
import type { Metadata } from 'next'
import { prisma } from '../lib/db'

// Enable ISR with 60 seconds revalidation
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Web3 Jobs | Remote Blockchain Developer Careers 2024',
  description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs. Remote opportunities at leading crypto companies including smart contract developer, blockchain engineer, DeFi analyst positions.',
  keywords: [
    'web3 jobs', 'blockchain jobs', 'cryptocurrency jobs', 'defi jobs', 'remote blockchain developer',
    'smart contract developer', 'blockchain engineer', 'crypto jobs', 'ethereum developer',
    'solidity developer', 'web3 careers', 'blockchain careers', 'crypto careers',
    'remote crypto jobs', 'decentralized finance jobs', 'NFT jobs', 'DAO jobs',
    'layer 2 jobs', 'polygon jobs', 'avalanche jobs', 'chainlink jobs', 'uniswap jobs'
  ],
  openGraph: {
    title: 'Web3 Jobs | Remote Blockchain Developer Careers 2024',
    description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs. Remote opportunities at leading crypto companies.',
    url: 'https://www.remotejobs.top',
    siteName: 'Web3 Jobs Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Jobs Platform - Find Your Dream Blockchain Career',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Jobs | Remote Blockchain Developer Careers 2024',
    description: 'Find the best Web3, blockchain, cryptocurrency & DeFi jobs.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://www.remotejobs.top',
  },
}

// Get initial data on the server side
async function getInitialData() {
  try {
    const [featuredJobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: { remote: true },
        orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
        take: 6,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          remote: true,
          tags: true,
          url: true,
          source: true,
          postedAt: true,
          createdAt: true,
          salary: true,
          seniorityLevel: true,
          description: true
        }
      }),
      prisma.job.count()
    ])
    
    return {
      featuredJobs: featuredJobs.map(job => ({
        ...job,
        postedAt: job.postedAt?.toISOString() || null,
        createdAt: job.createdAt.toISOString()
      })),
      totalCount
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
    return {
      featuredJobs: [],
      totalCount: 0
    }
  }
}

export default async function Page() {
  const initialData = await getInitialData()
  
  return <ModernHomepage initialData={initialData} />
}
