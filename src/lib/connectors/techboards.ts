import { sha256, parseTags } from '../utils'
import { config } from '../config'

type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}

export async function fetchTechBoards(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate fetching from multiple tech job boards
    // In a real implementation, you'd use APIs or scrape these boards

    // Hacker News "Who is Hiring?" threads
    const hackerNewsJobs = await fetchHackerNewsJobs()
    jobs.push(...hackerNewsJobs)

    // GitHub Jobs (deprecated but we can simulate)
    const githubJobs = await fetchGitHubJobs()
    jobs.push(...githubJobs)

    // Stack Overflow Jobs
    const stackoverflowJobs = await fetchStackOverflowJobs()
    jobs.push(...stackoverflowJobs)

  } catch (error) {
    console.warn('Error fetching tech board jobs:', error)
  }

  return jobs
}

async function fetchHackerNewsJobs(): Promise<Job[]> {
  const jobs: Job[] = []
  const web3Keywords = ['blockchain', 'crypto', 'web3', 'bitcoin', 'ethereum', 'solidity', 'defi']

  try {
    // Simulate HN "Who is Hiring?" monthly thread
    const hnCompanies = [
      'Brave Software', 'Mozilla', 'Cloudflare', 'Digital Ocean',
      'Stripe', 'Twilio', 'GitHub', 'GitLab'
    ]

    const hnRoles = [
      'Senior Software Engineer', 'Full Stack Developer', 'Backend Engineer',
      'DevOps Engineer', 'Security Engineer', 'Systems Engineer'
    ]

    // Generate some HN-style job postings
    for (const company of hnCompanies.slice(0, 3)) {
      for (const role of hnRoles.slice(0, 2)) {
        // Add Web3 focus to some roles
        const web3Focus = Math.random() > 0.7
        const web3KeywordsText = web3Focus ? ' with focus on blockchain/Web3 technologies' : ''

        const id = sha256(`${role}|${company}|hackernews|${Date.now()}`)
        const tags = parseTags([
          role.toLowerCase().replace(/\s+/g, '-'),
          company.toLowerCase(),
          ...(web3Focus ? ['web3', 'blockchain'] : [])
        ])

        jobs.push({
          id,
          title: role + web3Focus ? ' (Web3 Focus)' : '',
          company,
          location: 'Remote',
          remote: true,
          tags,
          url: `https://news.ycombinator.com/item?id=${Math.floor(Math.random() * 1000000)}`,
          source: 'hackernews',
          postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last month
          createdAt: new Date(),
          salary: `$${(90000 + Math.floor(Math.random() * 110000)).toLocaleString()}`,
          currency: 'USD',
          employmentType: 'Full-time',
          description: `${company} is looking for a ${role.toLowerCase()}${web3KeywordsText}. Join our team and work on interesting technical challenges.`
        })
      }
    }
  } catch (error) {
    console.warn('Error fetching Hacker News jobs:', error)
  }

  return jobs
}

async function fetchGitHubJobs(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate GitHub Jobs (API is deprecated but we can create realistic postings)
    const githubCompanies = [
      'Microsoft', 'GitHub', 'GitLab', 'VSCode', 'Docker',
      'Kubernetes', 'Terraform', 'AWS', 'Google Cloud'
    ]

    const githubRoles = [
      'Senior Developer Advocate', 'Open Source Developer', 'DevRel Engineer',
      'Site Reliability Engineer', 'Infrastructure Engineer'
    ]

    for (const company of githubCompanies.slice(0, 3)) {
      for (const role of githubRoles.slice(0, 2)) {
        const id = sha256(`${role}|${company}|github|${Date.now()}`)
        const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), company.toLowerCase()])

        jobs.push({
          id,
          title: role,
          company,
          location: 'Remote',
          remote: true,
          tags,
          url: `https://github.com/about/jobs`,
          source: 'github',
          postedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Within last 2 weeks
          createdAt: new Date(),
          salary: `$${(100000 + Math.floor(Math.random() * 100000)).toLocaleString()}`,
          currency: 'USD',
          employmentType: 'Full-time',
          description: `${company} is seeking a ${role.toLowerCase()} to help developers succeed with our platform.`
        })
      }
    }
  } catch (error) {
    console.warn('Error fetching GitHub jobs:', error)
  }

  return jobs
}

async function fetchStackOverflowJobs(): Promise<Job[]> {
  const jobs: Job[] = []

  try {
    // Simulate Stack Overflow Jobs
    const soCompanies = [
      'Stack Overflow', 'Discord', 'Slack', 'Figma', 'Notion',
      'Airtable', 'Retool', 'Vercel', 'Netlify'
    ]

    const soRoles = [
      'Senior Full Stack Engineer', 'Frontend Specialist', 'Backend Developer',
      'Platform Engineer', 'Developer Experience Engineer'
    ]

    for (const company of soCompanies.slice(0, 3)) {
      for (const role of soRoles.slice(0, 2)) {
        const id = sha256(`${role}|${company}|stackoverflow|${Date.now()}`)
        const tags = parseTags([role.toLowerCase().replace(/\s+/g, '-'), company.toLowerCase()])

        jobs.push({
          id,
          title: role,
          company,
          location: 'Remote',
          remote: true,
          tags,
          url: `https://stackoverflow.com/jobs/${Math.floor(Math.random() * 10000)}`,
          source: 'stackoverflow',
          postedAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000), // Within last 3 weeks
          createdAt: new Date(),
          salary: `$${(85000 + Math.floor(Math.random() * 95000)).toLocaleString()}`,
          currency: 'USD',
          employmentType: 'Full-time',
          description: `${company} is hiring a ${role.toLowerCase()} to build tools that developers love.`
        })
      }
    }
  } catch (error) {
    console.warn('Error fetching Stack Overflow jobs:', error)
  }

  return jobs
}