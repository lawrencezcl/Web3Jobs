import { sha256, parseTags } from '../utils'
import { config } from '../config'

type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}

export async function fetchCryptoBoards(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Fetch from various crypto-specific job boards
    const cryptoComJobs = await fetchCryptoComJobs()
    jobs.push(...cryptoComJobs)

    const defiPulseJobs = await fetchDefiPulseJobs()
    jobs.push(...defiPulseJobs)

    const banklessJobs = await fetchBanklessJobs()
    jobs.push(...banklessJobs)

    const twitterJobs = await fetchTwitterJobs()
    jobs.push(...twitterJobs)

  } catch (error) {
    console.warn('Error fetching crypto board jobs:', error)
  }

  return jobs
}

async function fetchCryptoComJobs(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate Crypto.com jobs
    const roles = [
      'Senior Blockchain Engineer', 'DeFi Product Manager', 'Crypto Compliance Specialist',
      'Web3 Security Engineer', 'Smart Contract Auditor', 'Cryptocurrency Trading Engineer'
    ]

    for (const role of roles) {
      const id = sha256(`${role}|crypto.com|${Date.now()}`)
      const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), 'crypto.com', 'cryptocurrency'])

      jobs.push({
        id,
        title: role,
        company: 'Crypto.com',
        location: 'Remote / Singapore',
        remote: true,
        tags,
        url: 'https://crypto.com/careers',
        source: 'crypto.com',
        postedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Within last 10 days
        createdAt: new Date(),
        salary: `$${(90000 + Math.floor(Math.random() * 130000)).toLocaleString()} - $${(150000 + Math.floor(Math.random() * 100000)).toLocaleString()}`,
        currency: 'USD',
        employmentType: 'Full-time',
        description: `Join Crypto.com as a ${role.toLowerCase()}. Work on the forefront of cryptocurrency adoption and build the future of financial services.`
      })
    }
  } catch (error) {
    console.warn('Error fetching Crypto.com jobs:', error)
  }

  return jobs
}

async function fetchDefiPulseJobs(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate DeFi Pulse jobs
    const defiCompanies = [
      'MakerDAO', 'Compound', 'Aave', 'Uniswap Labs', 'Curve Finance',
      'Yearn Finance', 'Synthetix', 'Balancer', 'SushiSwap'
    ]

    const defiRoles = [
      'Protocol Engineer', 'DeFi Research Analyst', 'Smart Contract Developer',
      'Liquidity Manager', 'Yield Farmer Specialist', 'DeFi Frontend Developer'
    ]

    for (const company of defiCompanies.slice(0, 5)) {
      for (const role of defiRoles.slice(0, 2)) {
        const id = sha256(`${role}|${company}|defipulse|${Date.now()}`)
        const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), company.toLowerCase(), 'defi'])

        jobs.push({
          id,
          title: role,
          company,
          location: 'Remote',
          remote: true,
          tags,
          url: `https://${company.toLowerCase().replace(' ', '')}.jobs`,
          source: 'defipulse',
          postedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Within last 2 weeks
          createdAt: new Date(),
          salary: `${(0.5 + Math.random() * 2).toFixed(1)} ETH + tokens`,
          currency: 'ETH',
          employmentType: 'Full-time',
          description: `${company} is seeking a ${role.toLowerCase()} to help build the future of decentralized finance.`
        })
      }
    }
  } catch (error) {
    console.warn('Error fetching DeFi Pulse jobs:', error)
  }

  return jobs
}

async function fetchBanklessJobs(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate BanklessDAO and related ecosystem jobs
    const banklessRoles = [
      'DAO Contributor', 'Web3 Content Creator', 'Crypto Community Manager',
      'Governance Specialist', 'Token Economics Analyst', 'Web3 Marketing Manager'
    ]

    for (const role of banklessRoles) {
      const id = sha256(`${role}|bankless|${Date.now()}`)
      const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), 'bankless', 'dao'])

      jobs.push({
        id,
        title: role,
        company: 'BanklessDAO',
        location: 'Remote',
        remote: true,
        tags,
        url: 'https://banklessdao.com/jobs',
        source: 'bankless',
        postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
        createdAt: new Date(),
        salary: 'DAO tokens + stipend',
        currency: 'USD',
        employmentType: 'Part-time / Contract',
        description: `BanklessDAO is looking for a ${role.toLowerCase()} to help accelerate the transition to a bankless future.`
      })
    }
  } catch (error) {
    console.warn('Error fetching Bankless jobs:', error)
  }

  return jobs
}

async function fetchTwitterJobs(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate Twitter/X crypto job postings
    const twitterCryptoCompanies = [
      'Vitalik Buterin', 'SatoshiStreetBets', 'CryptoTwitter', 'Web3Jobs',
      'BlockchainRecruiter', 'DeFiHiring', 'NFTCommunity', 'CryptoJobs'
    ]

    const twitterRoles = [
      'Smart Contract Developer', 'Web3 Developer', 'Blockchain Engineer',
      'Crypto Marketing Manager', 'NFT Project Manager', 'DeFi Analyst'
    ]

    for (const company of twitterCryptoCompanies.slice(0, 4)) {
      for (const role of twitterRoles.slice(0, 2)) {
        const id = sha256(`${role}|${company}|twitter|${Date.now()}`)
        const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), company.toLowerCase(), 'twitter'])

        jobs.push({
          id,
          title: role,
          company: company,
          location: 'Remote',
          remote: true,
          tags,
          url: `https://twitter.com/${company.toLowerCase().replace(' ', '')}`,
          source: 'twitter',
          postedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Within last 3 days
          createdAt: new Date(),
          salary: 'Competitive',
          currency: 'USD',
          employmentType: 'Full-time / Contract',
          description: `Exciting ${role.toLowerCase()} opportunity shared by ${company} on Twitter. Join innovative Web3 projects.`
        })
      }
    }
  } catch (error) {
    console.warn('Error fetching Twitter jobs:', error)
  }

  return jobs
}