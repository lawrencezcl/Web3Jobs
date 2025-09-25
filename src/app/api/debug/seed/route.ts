import { prisma } from '../../../../lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Sample remote Web3 jobs
const sampleJobs = [
  {
    id: 'sample-remote-job-1',
    title: 'Senior Blockchain Developer',
    company: 'CryptoStart',
    location: 'Remote',
    remote: true,
    tags: 'blockchain,solidity,smart-contracts,web3',
    url: 'https://example.com/job1',
    source: 'sample',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(),
    salary: '$120,000 - $180,000',
    currency: 'USD',
    employmentType: 'Full-time',
    seniorityLevel: 'Senior',
    description: 'We are looking for a Senior Blockchain Developer with experience in smart contract development using Solidity. The ideal candidate will have extensive experience with DeFi protocols and Web3 technologies.'
  },
  {
    id: 'sample-remote-job-2',
    title: 'Frontend React Developer - Web3',
    company: 'DeFiProtocol',
    location: 'Remote (Global)',
    remote: true,
    tags: 'react,typescript,web3,ethereum,defi',
    url: 'https://example.com/job2',
    source: 'sample',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    createdAt: new Date(),
    salary: '$90,000 - $140,000',
    currency: 'USD',
    employmentType: 'Full-time',
    seniorityLevel: 'Mid-level',
    description: 'Join our team as a Frontend React Developer focused on building DeFi applications. Experience with Web3 libraries like ethers.js or web3.js is required.'
  },
  {
    id: 'sample-remote-job-3',
    title: 'Smart Contract Auditor',
    company: 'BlockchainSecurity',
    location: 'Remote',
    remote: true,
    tags: 'solidity,security,audit,smart-contracts',
    url: 'https://example.com/job3',
    source: 'sample',
    postedAt: new Date(), // Today
    createdAt: new Date(),
    salary: '$150,000 - $200,000',
    currency: 'USD',
    employmentType: 'Full-time',
    seniorityLevel: 'Senior',
    description: 'We are seeking a Smart Contract Auditor to review and analyze smart contracts for security vulnerabilities. Strong background in Ethereum security and DeFi protocols required.'
  }
]

export async function GET() {
  try {
    // Clear existing sample jobs
    await prisma.job.deleteMany({
      where: {
        source: 'sample'
      }
    })

    // Insert sample jobs
    const createdJobs = await Promise.all(
      sampleJobs.map(job =>
        prisma.job.create({
          data: job
        })
      )
    )

    return Response.json({
      success: true,
      message: `Created ${createdJobs.length} sample remote jobs`,
      jobs: createdJobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        remote: job.remote,
        source: job.source
      }))
    })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}