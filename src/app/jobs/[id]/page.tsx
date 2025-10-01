import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/db'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import Link from 'next/link'
import Breadcrumb from '../../../components/breadcrumb'

// Enable ISR with longer revalidation for job details
export const revalidate = 3600 // 1 hour

// Generate static params for popular job pages
export async function generateStaticParams() {
  try {
    const jobs = await prisma.job.findMany({
      select: { id: true },
      orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
      take: 100 // Pre-generate top 100 job pages
    })
    
    return jobs.map((job) => ({
      id: job.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Utility function to decode HTML entities and format markdown
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// Utility function to convert markdown-like text to HTML
function convertMarkdownToHtml(text: string): string {
  return text
    // First, handle escaped newlines from database
    .replace(/\\n/g, '\n')
    // Convert markdown headers to HTML headers (before line break conversion)
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 mt-8">$1</h1>')
    // Convert bullet points (before line break conversion)
    .replace(/^• (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
    .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
    // Convert line breaks to <br> but preserve structure
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    // Wrap consecutive <li> elements in <ul>
    .replace(/(<li[^>]*>.*?<\/li>(?:<br>)*)+/gs, '<ul class="list-disc list-inside space-y-1 mb-4 ml-4">$&</ul>')
    // Clean up breaks around headers and lists
    .replace(/(<\/h[123]>)<br>/g, '$1')
    .replace(/(<\/ul>)<br>/g, '$1')
    .replace(/(<ul[^>]*>)<br>/g, '$1')
    // Remove breaks inside list items
    .replace(/(<li[^>]*>[^<]*)<br>(<\/li>)/g, '$1$2')
    // Wrap content in paragraphs if it doesn't start with a header
    .replace(/^(?!<[h123]|<ul|<p)/gm, '<p class="mb-4">')
    // Clean up multiple breaks
    .replace(/<br><br><br>/g, '<br><br>')
    .replace(/<br><br>/g, '<br>')
    // Ensure proper paragraph closing
    .replace(/(<p[^>]*>[^<]*(?:<[^/][^>]*>[^<]*<\/[^>]+>[^<]*)*[^<]+)(?=<[h123]|<ul|$)/g, '$1</p>')
    // Clean up empty paragraphs
    .replace(/<p[^>]*><\/p>/g, '')
    .replace(/<p[^>]*>\s*<\/p>/g, '')
}

// Utility function to extract contact info from job descriptions
function extractContactInfo(description: string): { emails: string[], links: string[] } {
  const emails: string[] = []
  const links: string[] = []

  // Extract email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const foundEmails = description.match(emailRegex)
  if (foundEmails) {
    emails.push(...foundEmails)
  }

  // Extract URLs that might be application links
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  const foundUrls = description.match(urlRegex)
  if (foundUrls) {
    // Filter out common non-application URLs
    const filteredUrls = foundUrls.filter(url =>
      !url.includes('coinbase.com/careers') &&
      !url.includes('github.com') &&
      !url.includes('linkedin.com') &&
      !url.includes('twitter.com') &&
      !url.includes('vercel.com')
    )
    links.push(...filteredUrls)
  }

  return { emails, links }
}

type Props = {
  params: { id: string }
}

async function getJob(id: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      // Use specific field selection for better performance
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
        currency: true,
        employmentType: true,
        seniorityLevel: true,
        description: true
      }
    })
    return job
  } catch (error) {
    console.error('Error fetching job:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob(params.id)
  
  if (!job) {
    return {
      title: 'Job Not Found - Web3 Jobs Platform',
      description: 'The requested job listing could not be found. Explore other Web3 opportunities.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${job.title} at ${job.company} | Web3 Jobs ${new Date().getFullYear()}`
  const description = job.description 
    ? `${job.title} position at ${job.company}. ${job.description.slice(0, 140)}... ${job.remote ? 'Remote work available.' : job.location ? `Located in ${job.location}.` : ''} Apply now for this Web3 opportunity.`
    : `${job.title} position at ${job.company}. ${job.remote ? 'Remote' : job.location || 'Location TBD'}. Join one of the leading Web3 companies building the future of decentralized finance.`

  const keywords = [
    job.title.toLowerCase(),
    job.company.toLowerCase(),
    'web3 jobs',
    'blockchain jobs',
    'cryptocurrency jobs',
    'defi jobs',
    job.remote ? 'remote blockchain jobs' : 'blockchain jobs',
    ...(job.tags ? job.tags.split(',').map(tag => tag.trim().toLowerCase()) : []),
    job.source
  ]

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Web3 Jobs Platform' }],
    creator: 'Web3 Jobs Platform',
    publisher: 'Web3 Jobs Platform',
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.richidea.top/jobs/${job.id}`,
      siteName: 'Web3 Jobs Platform',
      publishedTime: job.postedAt?.toISOString() || job.createdAt.toISOString(),
      modifiedTime: job.createdAt.toISOString(),
      images: [
        {
          url: '/og-job-image.png',
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.company} - Web3 Jobs Platform`
        }
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-job-image.png'],
      creator: '@web3jobsplatform',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://www.richidea.top/jobs/${job.id}`,
    },
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

  // Process job description
  let processedDescription = job.description || ''
  let contactInfo = { emails: [] as string[], links: [] as string[] }

  if (processedDescription) {
    // Decode HTML entities
    processedDescription = decodeHtmlEntities(processedDescription)
    // Convert markdown-like formatting to HTML
    processedDescription = convertMarkdownToHtml(processedDescription)
    // Extract contact information
    contactInfo = extractContactInfo(processedDescription)
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Breadcrumb 
        items={[
          { label: 'Jobs', href: '/jobs' },
          { label: `${job.title} at ${job.company}` }
        ]}
      />

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

          {/* Contact Information */}
          {(contactInfo.emails.length > 0 || contactInfo.links.length > 0) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                {contactInfo.emails.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-sm">Email Addresses:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {contactInfo.emails.map((email, index) => (
                        <a
                          key={index}
                          href={`mailto:${email}`}
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                          {email}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {contactInfo.links.length > 0 && (
                  <div>
                    <span className="text-slate-400 text-sm">Application Links:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {contactInfo.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm underline break-all"
                        >
                          {link.length > 50 ? link.substring(0, 50) + '...' : link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Description */}
          {processedDescription && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Job Description</h3>
              <div className="prose prose-invert max-w-none">
                <div
                  className="text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: processedDescription }}
                />
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

      {/* Enhanced JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.title,
            "description": job.description || `${job.title} position at ${job.company}. Join one of the leading Web3 companies building the future of decentralized finance.`,
            "identifier": {
              "@type": "PropertyValue",
              "name": job.company,
              "value": job.id
            },
            "datePosted": job.postedAt?.toISOString() || job.createdAt.toISOString(),
            "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            "hiringOrganization": {
              "@type": "Organization",
              "name": job.company,
              "sameAs": job.url
            },
            "jobLocation": job.remote ? {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Remote",
                "addressCountry": "Worldwide"
              }
            } : {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location || "Location TBD"
              }
            },
            "employmentType": job.employmentType || "FULL_TIME",
            "workHours": job.remote ? "Remote Work" : "Full-time",
            "baseSalary": job.salary ? {
              "@type": "MonetaryAmount",
              "currency": job.currency || "USD",
              "value": {
                "@type": "QuantitativeValue",
                "value": job.salary,
                "unitText": "YEAR"
              }
            } : undefined,
            "url": job.url,
            "industry": "Blockchain, Web3, Cryptocurrency, Decentralized Finance",
            "occupationalCategory": "Technology",
            "skills": job.tags ? job.tags.split(',').map(tag => tag.trim()) : [],
            "qualifications": job.description ? "Experience in Web3, blockchain technology, and decentralized applications" : undefined,
            "responsibilities": job.description ? "Develop and maintain blockchain applications, smart contracts, and Web3 infrastructure" : undefined,
            "benefits": "Competitive salary, remote work, equity/token compensation, professional development",
            "applicationContact": {
              "@type": "ContactPoint",
              "url": job.url
            }
          })
        }}
      />
    </div>
  )
}