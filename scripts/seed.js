#!/usr/bin/env node

/**
 * Web3 Remote Jobs Platform - Database Seed Script
 * Creates initial test data for local development
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleJobs = [
  {
    id: 'job-1-web3-developer',
    title: 'Senior Web3 Developer',
    company: 'DeFi Protocol Inc',
    location: 'Remote',
    country: 'Global',
    remote: true,
    tags: 'web3,solidity,react,defi',
    url: 'https://example.com/job/1',
    source: 'manual',
    description: 'Join our team to build the future of decentralized finance. We are looking for a senior developer with experience in Solidity and React.',
    salary: '$80k - $120k',
    salaryMin: 80000,
    salaryMax: 120000,
    currency: 'USD',
    employmentType: 'Full-time',
    seniorityLevel: 'Senior',
    postedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 'job-2-blockchain-engineer',
    title: 'Blockchain Engineer',
    company: 'NFT Marketplace',
    location: 'Remote',
    country: 'USA',
    remote: true,
    tags: 'blockchain,ethereum,smart-contracts',
    url: 'https://example.com/job/2',
    source: 'manual',
    description: 'Build and maintain smart contracts for our NFT marketplace platform.',
    salary: '$60k - $90k',
    salaryMin: 60000,
    salaryMax: 90000,
    currency: 'USD',
    employmentType: 'Full-time',
    seniorityLevel: 'Mid-level',
    postedAt: new Date('2024-01-14T14:30:00Z')
  },
  {
    id: 'job-3-crypto-frontend',
    title: 'Frontend Developer - Crypto',
    company: 'Web3 Startup',
    location: 'Remote',
    country: 'Europe',
    remote: true,
    tags: 'frontend,web3,typescript,next.js',
    url: 'https://example.com/job/3',
    source: 'manual',
    description: 'Create beautiful and intuitive interfaces for Web3 applications.',
    salary: '€45k - €70k',
    salaryMin: 45000,
    salaryMax: 70000,
    currency: 'EUR',
    employmentType: 'Full-time',
    seniorityLevel: 'Junior',
    postedAt: new Date('2024-01-13T09:15:00Z')
  }
]

const sampleSubscribers = [
  {
    id: 'sub-1-telegram',
    type: 'telegram',
    identifier: '123456789',
    topics: 'web3,blockchain,defi'
  },
  {
    id: 'sub-2-discord',
    type: 'discord',
    identifier: 'https://discord.com/api/webhooks/...',
    topics: 'all'
  }
]

async function seed() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.crawlLog.deleteMany()
    await prisma.subscriber.deleteMany()
    await prisma.job.deleteMany()

    // Insert sample jobs
    console.log('💼 Creating sample jobs...')
    for (const job of sampleJobs) {
      await prisma.job.create({ data: job })
      console.log(`  ✅ Created job: ${job.title}`)
    }

    // Insert sample subscribers
    console.log('📧 Creating sample subscribers...')
    for (const subscriber of sampleSubscribers) {
      await prisma.subscriber.create({ data: subscriber })
      console.log(`  ✅ Created subscriber: ${subscriber.type}`)
    }

    // Create sample crawl logs
    console.log('📊 Creating sample crawl logs...')
    await prisma.crawlLog.create({
      data: {
        id: 'crawl-1-manual',
        source: 'manual',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T10:05:00Z'),
        status: 'completed',
        jobsFound: 3,
        jobsInserted: 3,
        metadata: JSON.stringify({ seedData: true })
      }
    })

    console.log('✅ Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Jobs: ${sampleJobs.length}`)
    console.log(`   - Subscribers: ${sampleSubscribers.length}`)
    console.log(`   - Crawl Logs: 1`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seed()