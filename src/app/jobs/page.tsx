import { Metadata } from 'next'
import { prisma } from '../../lib/db'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import Link from 'next/link'
import Breadcrumb from '../../components/breadcrumb'
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock,
  Filter
} from 'lucide-react'

// Enable ISR with 60 seconds revalidation
export const revalidate = 60

type Job = {
  id: string
  title: string
  company: string
  location?: string | null
  remote: boolean
  tags?: string | null
  url: string
  source: string
  postedAt?: Date | null
  createdAt: Date
  salary?: string | null
  seniorityLevel?: string | null
  employmentType?: string | null
}

type SearchParams = {
  q?: string
  tag?: string
  remote?: string
  source?: string
  page?: string
}

interface PageProps {
  searchParams: SearchParams
}

async function getJobs(searchParams: SearchParams) {
  const {
    q = '',
    tag = '',
    remote = 'true',
    source = '',
    page = '1'
  } = searchParams

  const currentPage = Math.max(1, parseInt(page))
  const limit = 20
  const skip = (currentPage - 1) * limit

  const where: any = {}
  
  if (remote) where.remote = remote === 'true'
  if (source) where.source = source
  if (tag) where.tags = { contains: tag, mode: 'insensitive' }
  
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { company: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { tags: { contains: q, mode: 'insensitive' } },
    ]
  }

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip,
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
          employmentType: true
        }
      }),
      prisma.job.count({ where })
    ])

    return {
      jobs: jobs.map(job => ({
        ...job,
        postedAt: job.postedAt,
        createdAt: job.createdAt
      })),
      total,
      currentPage,
      totalPages: Math.ceil(total / limit)
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return {
      jobs: [],
      total: 0,
      currentPage: 1,
      totalPages: 0
    }
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q, tag, remote } = searchParams
  
  let title = 'All Web3 Jobs'
  let description = 'Browse all Web3, blockchain, and cryptocurrency job opportunities.'
  
  if (q) {
    title = `${q} Jobs - Web3 Jobs Platform`
    description = `Find ${q} positions in Web3, blockchain, and cryptocurrency companies.`
  } else if (tag) {
    title = `${tag} Jobs - Web3 Jobs Platform`
    description = `Browse ${tag} opportunities in the Web3 and blockchain space.`
  }
  
  if (remote === 'true') {
    title = `Remote ${title}`
    description = `${description} Work remotely from anywhere in the world.`
  }

  const keywords = [
    'web3 jobs', 'blockchain jobs', 'cryptocurrency jobs', 'defi jobs',
    'remote blockchain developer', 'smart contract developer', 'web3 careers',
    ...(q ? [q.toLowerCase()] : []),
    ...(tag ? [tag.toLowerCase()] : []),
    'remote work', 'blockchain careers', 'crypto careers'
  ]

  return {
    title: `${title} | Web3 Jobs Platform`,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: `${title} | Web3 Jobs Platform`,
      description,
      type: 'website',
      url: 'https://www.richidea.top/jobs',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Web3 Jobs Platform`,
      description,
    },
    alternates: {
      canonical: 'https://www.richidea.top/jobs',
    }
  }
}

export default async function JobsPage({ searchParams }: PageProps) {
  const { jobs, total, currentPage, totalPages } = await getJobs(searchParams)
  const { q = '', tag = '', remote = 'true', source = '' } = searchParams

  const formatDate = (date: Date | null) => {
    if (!date) return 'Recently'
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays}d ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
    return `${Math.floor(diffInDays / 30)}mo ago`
  }

  const formatSalary = (job: Job) => {
    if (job.salary) return job.salary
    return 'Competitive'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Jobs' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            All Web3 Jobs
            {q && <span className="text-blue-400"> for "{q}"</span>}
            {tag && <span className="text-purple-400"> in {tag}</span>}
          </h1>
          <p className="text-slate-400 text-lg">
            Discover {total.toLocaleString()} opportunities in blockchain, DeFi, and Web3
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
          <form method="GET" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    name="q"
                    placeholder="Search jobs, companies, or skills..."
                    defaultValue={q}
                    className="pl-10 bg-slate-800/50 border-slate-600"
                  />
                </div>
              </div>
              
              <div>
                <Input
                  name="tag"
                  placeholder="Skills (e.g. Solidity)"
                  defaultValue={tag}
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>

              <div>
                <select
                  name="remote"
                  defaultValue={remote}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-slate-100"
                >
                  <option value="true">🌍 Remote Only</option>
                  <option value="false">🏢 On-site/Hybrid</option>
                  <option value="">📍 All Locations</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-slate-400 text-sm">
                {total.toLocaleString()} opportunities found
              </div>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter Jobs
              </Button>
            </div>
          </form>
        </div>

        {/* Job Results */}
        {jobs.length > 0 ? (
          <>
            <div className="grid gap-6 mb-8">
              {jobs.map((job) => (
                <Card key={job.id} className="p-6 hover:bg-slate-800/50 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link href={`/jobs/${job.id}`} className="block">
                            <h2 className="text-xl font-semibold hover:text-blue-400 transition-colors mb-2">
                              {job.title}
                            </h2>
                          </Link>
                          <div className="flex items-center space-x-4 text-slate-400 mb-3">
                            <span className="font-medium text-slate-300">{job.company}</span>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.remote ? 'Remote' : job.location || 'On-site'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(job.postedAt)}
                            </div>
                          </div>
                        </div>
                        <Badge className="text-xs bg-slate-700 border-slate-600">
                          {job.source}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {job.tags && job.tags.split(',').filter(Boolean).slice(0, 4).map((tag, index) => (
                            <Badge key={index} className="text-xs bg-blue-500/10 text-blue-300 border-blue-500/20">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-green-400">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-sm">{formatSalary(job)}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Link 
                              href={`/jobs/${job.id}`}
                              className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm"
                            >
                              View Details
                            </Link>
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-colors text-sm"
                            >
                              Apply
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                {currentPage > 1 && (
                  <Link
                    href={`/jobs?${new URLSearchParams({ ...searchParams, page: (currentPage - 1).toString() }).toString()}`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Previous
                  </Link>
                )}
                
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                {currentPage < totalPages && (
                  <Link
                    href={`/jobs?${new URLSearchParams({ ...searchParams, page: (currentPage + 1).toString() }).toString()}`}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your search criteria or browse all available positions
            </p>
            <Link 
              href="/jobs"
              className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              View All Jobs
            </Link>
          </div>
        )}
      </div>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Web3 Jobs - All Blockchain Career Opportunities",
            "description": "Browse all Web3, blockchain, and cryptocurrency job opportunities from leading companies.",
            "url": "https://www.richidea.top/jobs",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": total,
              "itemListElement": jobs.slice(0, 10).map((job, index) => ({
                "@type": "JobPosting",
                "position": index + 1,
                "title": job.title,
                "hiringOrganization": {
                  "@type": "Organization",
                  "name": job.company
                },
                "jobLocation": job.remote ? {
                  "@type": "Place",
                  "address": "Remote"
                } : {
                  "@type": "Place",
                  "address": job.location || "Location TBD"
                },
                "datePosted": job.postedAt?.toISOString() || job.createdAt.toISOString(),
                "url": `https://www.richidea.top/jobs/${job.id}`
              }))
            }
          })
        }}
      />
    </div>
  )
}