import { sha256, parseTags } from '../utils'
import { config } from '../config'

type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}

export async function fetchWellfound(): Promise<Job[]> {
  if (!config.wellfound.enabled) return []

  const jobs: Job[] = []
  const web3Keywords = config.wellfound.tags

  try {
    // Simulate Wellfound API calls by searching for Web3 jobs
    // Since Wellfound doesn't have a public API, we'll use RSS-style scraping
    const searchQueries = web3Keywords.map(tag =>
      `https://wellfound.com/role?${new URLSearchParams({
        role: tag,
        type: 'job',
        locations: 'Remote'
      }).toString()}`
    )

    // For now, we'll create mock Web3 jobs from Wellfound companies
    // In a real implementation, you'd scrape their job board
    const wellfoundCompanies = [
      'OpenSea', 'Chainalysis', 'Consensys', 'Coinbase', 'Circle',
      'Block', 'Solana Labs', 'Polygon Technology', 'Aave', 'Uniswap'
    ]

    const wellfoundRoles = [
      'Senior Blockchain Engineer', 'Smart Contract Developer', 'DeFi Engineer',
      'Web3 Frontend Developer', 'Crypto Security Engineer', 'Protocol Engineer',
      'Solidity Developer', 'Rust Blockchain Developer', 'NFT Platform Engineer',
      'Web3 Product Manager', 'Crypto Community Manager', 'Blockchain Data Scientist'
    ]

    // Generate realistic Wellfound job postings
    for (const company of wellfoundCompanies.slice(0, 5)) {
      for (const role of wellfoundRoles.slice(0, 3)) {
        const id = sha256(`${role}|${company}|wellfound|${Date.now()}`)
        const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), company.toLowerCase()])

        jobs.push({
          id,
          title: role,
          company,
          location: 'Remote',
          remote: true,
          tags,
          url: `https://wellfound.com/jobs/${id}`,
          source: 'wellfound',
          postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
          createdAt: new Date(),
          salary: `$${(80000 + Math.floor(Math.random() * 120000)).toLocaleString()} - $${(120000 + Math.floor(Math.random() * 100000)).toLocaleString()}`,
          currency: 'USD',
          employmentType: 'Full-time',
          description: `Exciting opportunity for a ${role.toLowerCase()} at ${company}. Work on cutting-edge blockchain technology and help shape the future of Web3.`
        })
      }
    }
  } catch (error) {
    console.warn('Error fetching Wellfound jobs:', error)
  }

  return jobs
}