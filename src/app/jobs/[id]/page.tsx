import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/db'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import Link from 'next/link'

type Props = {
  params: { id: string }
}

async function getJob(id: string) {
  const job = await prisma.job.findUnique({
    where: { id }
  })
  return job
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob(params.id)
  
  if (!job) {
    return {
      title: 'Job Not Found - Web3 Remote Jobs',
      description: 'The requested job listing could not be found.'
    }
  }

  const title = `${job.title} at ${job.company} - Web3 Remote Jobs`
  const description = job.description 
    ? job.description.slice(0, 160) + '...'
    : `${job.title} position at ${job.company}. ${job.remote ? 'Remote' : job.location || 'Location TBD'}. Apply now for this Web3 opportunity.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://your-domain.com/jobs/${job.id}`,
      siteName: 'Web3 Remote Jobs',
      images: [
        {
          url: '/og-job-image.png', // You'll need to create this
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.company}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-job-image.png']
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export default async function JobDetailPage({ params }: Props) {
  const job = await getJob(params.id)

  if (!job) {
    notFound()
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Date not available'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  }

  const tags = job.tags ? job.tags.split(',').filter(Boolean) : []

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
          ← Back to all jobs
        </Link>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Job Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-lg text-slate-300">
              <span className="font-semibold">{job.company}</span>
              <span>•</span>
              <span>{job.remote ? 'Remote' : job.location || 'Location TBD'}</span>
              <span>•</span>
              <Badge className="text-sm border border-gray-300">
                {job.source}
              </Badge>
            </div>
          </div>

          {/* Job Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-slate-800">
            <div>
              <span className="text-slate-400 text-sm">Posted Date:</span>
              <p className="font-medium">{formatDate(job.postedAt)}</p>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Employment Type:</span>
              <p className="font-medium">{job.employmentType || 'Not specified'}</p>
            </div>
            {job.salary && (
              <div>
                <span className="text-slate-400 text-sm">Salary:</span>
                <p className="font-medium">
                  {job.salary} {job.currency && `(${job.currency})`}
                </p>
              </div>
            )}
            <div>
              <span className="text-slate-400 text-sm">Work Arrangement:</span>
              <p className="font-medium">{job.remote ? 'Remote' : 'On-site/Hybrid'}</p>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} className="text-sm">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          {job.description && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="pt-6">
            <Button className="w-full md:w-auto text-lg px-6 py-3">
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                Apply for this position
                <svg 
                  className="ml-2 h-4 w-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                  />
                </svg>
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description || `${job.title} position at ${job.company}`,
            "datePosted": job.postedAt?.toISOString() || job.createdAt.toISOString(),
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
            "employmentType": job.employmentType || "FULL_TIME",
            "workHours": job.remote ? "Remote" : "On-site",
            "baseSalary": job.salary ? {
              "@type": "MonetaryAmount",
              "currency": job.currency || "USD",
              "value": {
                "@type": "QuantitativeValue",
                "value": job.salary
              }
            } : undefined,
            "url": job.url,
            "industry": "Blockchain, Web3, Cryptocurrency"
          })
        }}
      />
    </div>
  )
}