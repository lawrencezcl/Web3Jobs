// Mock data for frontend UI/UX testing
export const mockJobs = [
  {
    id: "mock-1-senior-solidity-dev",
    title: "Senior Solidity Developer",
    company: "DeFi Protocol",
    location: "Remote",
    country: "Global",
    remote: true,
    tags: "solidity,defi,ethereum,smart-contracts,web3,blockchain,senior",
    url: "https://example.com/job/1",
    source: "mock",
    description: "We're looking for a Senior Solidity Developer to join our team and help build the future of decentralized finance. You'll work on cutting-edge smart contracts and DeFi protocols.",
    salary: "$120k - $180k",
    salaryMin: 120000,
    salaryMax: 180000,
    currency: "USD",
    employmentType: "Full-time",
    seniorityLevel: "Senior",
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-2-frontend-web3",
    title: "Frontend Developer - Web3",
    company: "Crypto Startup",
    location: "Remote",
    country: "USA",
    remote: true,
    tags: "react,typescript,web3,frontend,next.js,tailwind,wagmi",
    url: "https://example.com/job/2",
    source: "mock",
    description: "Join our frontend team to build beautiful and intuitive Web3 applications. Experience with React, TypeScript, and Web3 libraries required.",
    salary: "$80k - $120k",
    salaryMin: 80000,
    salaryMax: 120000,
    currency: "USD",
    employmentType: "Full-time",
    seniorityLevel: "Mid-level",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-3-blockchain-engineer",
    title: "Blockchain Engineer",
    company: "NFT Marketplace",
    location: "San Francisco, CA",
    country: "USA", 
    remote: false,
    tags: "golang,rust,blockchain,consensus,networking,distributed-systems",
    url: "https://example.com/job/3",
    source: "mock",
    description: "Build and maintain blockchain infrastructure for our NFT marketplace. Experience with Go, Rust, and distributed systems required.",
    salary: "$140k - $200k",
    salaryMin: 140000,
    salaryMax: 200000,
    currency: "USD",
    employmentType: "Full-time",
    seniorityLevel: "Senior",
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-4-product-manager-defi",
    title: "Product Manager - DeFi",
    company: "Ethereum Foundation",
    location: "Remote",
    country: "Global",
    remote: true,
    tags: "product-management,defi,ethereum,strategy,roadmap,stakeholders",
    url: "https://example.com/job/4",
    source: "mock",
    description: "Lead product strategy for DeFi initiatives. Work with engineering and design teams to define and execute product roadmaps.",
    salary: "$100k - $150k",
    salaryMin: 100000,
    salaryMax: 150000,
    currency: "USD",
    employmentType: "Full-time",
    seniorityLevel: "Mid-level",
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-5-devrel-engineer",
    title: "Developer Relations Engineer",
    company: "Layer 2 Solution",
    location: "Remote",
    country: "Europe",
    remote: true,
    tags: "developer-relations,community,documentation,sdk,api,technical-writing",
    url: "https://example.com/job/5",
    source: "mock",
    description: "Help developers integrate with our Layer 2 solution. Create documentation, SDKs, and developer tools. Engage with the developer community.",
    salary: "€60k - €90k",
    salaryMin: 60000,
    salaryMax: 90000,
    currency: "EUR",
    employmentType: "Full-time",
    seniorityLevel: "Mid-level",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-6-security-engineer",
    title: "Security Engineer - Smart Contracts",
    company: "Security Audit Firm",
    location: "Remote",
    country: "Global",
    remote: true,
    tags: "security,smart-contracts,auditing,solidity,vulnerability-research,pentesting",
    url: "https://example.com/job/6",
    source: "mock",
    description: "Conduct security audits of smart contracts and DeFi protocols. Identify vulnerabilities and provide recommendations for secure coding practices.",
    salary: "$130k - $190k",
    salaryMin: 130000,
    salaryMax: 190000,
    currency: "USD",
    employmentType: "Full-time", 
    seniorityLevel: "Senior",
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-7-backend-engineer",
    title: "Backend Engineer - Crypto Exchange",
    company: "Crypto Exchange",
    location: "London, UK",
    country: "UK",
    remote: false,
    tags: "backend,node.js,typescript,microservices,api,database,redis,postgresql",
    url: "https://example.com/job/7",
    source: "mock",
    description: "Build and maintain backend services for our cryptocurrency exchange. Work with high-performance trading systems and real-time data processing.",
    salary: "£70k - £110k",
    salaryMin: 70000,
    salaryMax: 110000,
    currency: "GBP",
    employmentType: "Full-time",
    seniorityLevel: "Mid-level",
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-8-ui-ux-designer",
    title: "UI/UX Designer - Web3 Wallet",
    company: "Wallet Provider",
    location: "Remote",
    country: "Global",
    remote: true,
    tags: "ui-design,ux-design,figma,web3,wallet,user-research,prototyping",
    url: "https://example.com/job/8",
    source: "mock",
    description: "Design intuitive and user-friendly interfaces for our Web3 wallet. Conduct user research and create prototypes for new features.",
    salary: "$70k - $110k",
    salaryMin: 70000,
    salaryMax: 110000,
    currency: "USD",
    employmentType: "Full-time",
    seniorityLevel: "Mid-level",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-9-data-scientist",
    title: "Data Scientist - Blockchain Analytics",
    company: "Analytics Platform",
    location: "Remote",
    country: "USA",
    remote: true,
    tags: "data-science,python,sql,blockchain,analytics,machine-learning,statistics",
    url: "https://example.com/job/9",
    source: "mock",
    description: "Analyze blockchain data to provide insights for our analytics platform. Build machine learning models for fraud detection and market analysis.",
    salary: "$95k - $140k",
    salaryMin: 95000,
    salaryMax: 140000,
    currency: "USD",
    employmentType: "Full-time",
    seniorityLevel: "Mid-level",
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-10-intern-developer",
    title: "Blockchain Developer Intern",
    company: "Web3 Accelerator",
    location: "Remote",
    country: "Global",
    remote: true,
    tags: "internship,blockchain,solidity,javascript,learning,mentorship,entry-level",
    url: "https://example.com/job/10",
    source: "mock",
    description: "Join our internship program to learn blockchain development. Work on real projects with mentorship from senior developers.",
    salary: "$20 - $30 /hour",
    salaryMin: 20,
    salaryMax: 30,
    currency: "USD",
    employmentType: "Internship",
    seniorityLevel: "Entry-level",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  }
]

export const mockFilters = {
  tags: ["solidity", "defi", "ethereum", "react", "typescript", "web3", "blockchain", "frontend", "backend", "remote"],
  countries: ["Global", "USA", "Europe", "UK", "Canada", "Australia"],
  companies: ["DeFi Protocol", "Crypto Startup", "NFT Marketplace", "Ethereum Foundation", "Layer 2 Solution"],
  seniorityLevels: ["Entry-level", "Mid-level", "Senior", "Lead", "Principal"]
}

export function searchMockJobs(query: {
  q?: string
  tag?: string  
  remote?: string
  page?: number
  limit?: number
  country?: string
  seniorityLevel?: string
}) {
  let filtered = [...mockJobs]
  
  // Filter by search query (title, company, tags)
  if (query.q) {
    const searchTerm = query.q.toLowerCase()
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.tags.toLowerCase().includes(searchTerm) ||
      (job.description && job.description.toLowerCase().includes(searchTerm))
    )
  }
  
  // Filter by tag
  if (query.tag) {
    const tag = query.tag.toLowerCase()
    filtered = filtered.filter(job => 
      job.tags.toLowerCase().includes(tag)
    )
  }
  
  // Filter by remote
  if (query.remote !== undefined) {
    const isRemote = query.remote === 'true'
    filtered = filtered.filter(job => job.remote === isRemote)
  }
  
  // Filter by country
  if (query.country) {
    filtered = filtered.filter(job => 
      job.country && job.country.toLowerCase().includes(query.country!.toLowerCase())
    )
  }
  
  // Filter by seniority level
  if (query.seniorityLevel) {
    filtered = filtered.filter(job => 
      job.seniorityLevel && job.seniorityLevel.toLowerCase().includes(query.seniorityLevel!.toLowerCase())
    )
  }
  
  // Pagination
  const page = query.page || 1
  const limit = query.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    items: filtered.slice(startIndex, endIndex),
    total: filtered.length,
    page,
    limit
  }
}