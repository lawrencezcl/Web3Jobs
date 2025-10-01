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
    // Simulate DeFi Pulse jobs with more detailed descriptions
    const defiCompanies = [
      'MakerDAO', 'Compound', 'Aave', 'Uniswap Labs', 'Curve Finance',
      'Yearn Finance', 'Synthetix', 'Balancer', 'SushiSwap'
    ]

    const defiRoles = [
      'Protocol Engineer', 'DeFi Research Analyst', 'Smart Contract Developer',
      'Liquidity Manager', 'Yield Farmer Specialist', 'DeFi Frontend Developer'
    ]

    // Detailed job descriptions for each role
    const roleDescriptions = {
      'Protocol Engineer': {
        summary: 'Design and implement core protocol features for decentralized finance applications.',
        responsibilities: [
          'Architect and develop smart contract protocols with security-first approach',
          'Optimize gas efficiency and transaction throughput for DeFi protocols',
          'Collaborate with security auditors to ensure protocol robustness',
          'Design tokenomics and governance mechanisms',
          'Work closely with product and design teams to implement user-facing features',
          'Research and implement cutting-edge DeFi primitives and mechanisms'
        ],
        requirements: [
          '5+ years of smart contract development experience',
          'Expert knowledge of Solidity, Vyper, or Rust',
          'Deep understanding of DeFi protocols (AMMs, lending, yield farming)',
          'Experience with EVM, Layer 2 solutions, and cross-chain protocols',
          'Strong mathematical background for financial modeling',
          'Bachelor\'s degree in Computer Science, Mathematics, or related field'
        ],
        benefits: [
          'Competitive salary and equity package',
          'Token allocations and DeFi yield opportunities',
          'Remote-first culture with flexible working hours',
          'Annual conferences and team retreats',
          'Learning budget for courses and certifications',
          'Health and wellness benefits'
        ]
      },
      'DeFi Research Analyst': {
        summary: 'Conduct in-depth research and analysis of DeFi protocols, markets, and emerging trends.',
        responsibilities: [
          'Analyze DeFi protocols, tokenomics, and market dynamics',
          'Research emerging DeFi trends and investment opportunities',
          'Create detailed reports on protocol risks and rewards',
          'Monitor on-chain data and identify market inefficiencies',
          'Collaborate with product teams to design new DeFi products',
          'Present findings to stakeholders and the broader DeFi community'
        ],
        requirements: [
          '3+ years of experience in DeFi or traditional finance',
          'Strong analytical skills and attention to detail',
          'Proficiency with on-chain analysis tools (Dune, The Graph, etc.)',
          'Understanding of financial derivatives and market-making',
          'Experience with Python, R, or SQL for data analysis',
          'Bachelor\'s or Master\'s degree in Finance, Economics, or related field'
        ],
        benefits: [
          'Competitive compensation in stablecoins or fiat',
          'Access to exclusive DeFi research and alpha',
          'Opportunity to shape the future of decentralized finance',
          'Remote work with global team collaboration',
          'Professional development and conference attendance',
          'Comprehensive health and retirement benefits'
        ]
      },
      'Smart Contract Developer': {
        summary: 'Build secure and efficient smart contracts for next-generation DeFi applications.',
        responsibilities: [
          'Develop and deploy smart contracts using Solidity and other languages',
          'Implement comprehensive testing suites and security measures',
          'Optimize contract gas usage and performance',
          'Integrate with frontend applications and external APIs',
          'Participate in code reviews and security audits',
          'Stay updated with latest smart contract best practices'
        ],
        requirements: [
          '3+ years of smart contract development experience',
          'Expert proficiency in Solidity, Hardhat, and testing frameworks',
          'Experience with DeFi protocols and ERC standards',
          'Knowledge of security vulnerabilities and mitigation strategies',
          'Familiarity with Layer 2 solutions and multi-chain deployment',
          'Computer Science degree or equivalent practical experience'
        ],
        benefits: [
          'Highly competitive salary and token incentives',
          'Opportunity to work on cutting-edge DeFi innovations',
          'Flexible remote work arrangements',
          'Access to the latest development tools and resources',
          'Mentorship from industry-leading developers',
          'Stock options and performance bonuses'
        ]
      }
    }

    for (const company of defiCompanies.slice(0, 5)) {
      for (const role of defiRoles.slice(0, 2)) {
        const id = sha256(`${role}|${company}|defipulse|${Date.now()}`)
        const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), company.toLowerCase(), 'defi'])
        
        // Get detailed description or fallback to basic one
        const roleDetails = roleDescriptions[role as keyof typeof roleDescriptions]
        
        let detailedDescription = `## About ${company}\n\n${company} is a leading protocol in the decentralized finance ecosystem, committed to building the future of open finance.\n\n`
        
        if (roleDetails) {
          detailedDescription += `## Position: ${role}\n\n${roleDetails.summary}\n\n`
          detailedDescription += `### Key Responsibilities:\n${roleDetails.responsibilities.map(item => `• ${item}`).join('\n')}\n\n`
          detailedDescription += `### Requirements:\n${roleDetails.requirements.map(item => `• ${item}`).join('\n')}\n\n`
          detailedDescription += `### What We Offer:\n${roleDetails.benefits.map(item => `• ${item}`).join('\n')}\n\n`
        } else {
          detailedDescription += `## Position: ${role}\n\nWe are seeking a talented ${role.toLowerCase()} to join our team and help build the future of decentralized finance. This role offers the opportunity to work on cutting-edge DeFi protocols and shape the financial infrastructure of tomorrow.\n\n`
          detailedDescription += `### What You'll Do:\\n• Design and implement innovative DeFi solutions\\n• Collaborate with world-class engineers and researchers\\n• Contribute to open-source protocols used by millions\\n• Research and develop new financial primitives\\n\\n`
          detailedDescription += `### What We're Looking For:\\n• Strong technical background in blockchain and smart contracts\\n• Passion for decentralized finance and Web3 technologies\\n• Experience with Solidity, JavaScript, or Python\\n• Understanding of financial markets and protocols\\n\\n`
        }
        
        detailedDescription += `### How to Apply:\\nJoin us in revolutionizing finance! Send your resume and a brief note about why you're excited about DeFi to our team.\\n\\n`
        detailedDescription += `*${company} is an equal opportunity employer committed to diversity and inclusion.*`

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
          description: detailedDescription
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