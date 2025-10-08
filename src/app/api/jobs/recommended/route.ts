import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

interface UserProfile {
  skills?: string[]
  preferredRoles?: string[]
  preferredLocations?: string[]
  salaryMin?: number
  salaryMax?: number
  experience?: Array<{
    title: string
    company: string
    duration: string
  }>
}

interface JobSimilarity {
  jobId: string
  score: number
  reasons: string[]
}

// Simple ML-like scoring algorithm for job recommendations
function calculateJobScore(
  job: any,
  userProfile: UserProfile,
  userHistory: any[]
): JobSimilarity {
  let score = 0
  const reasons: string[] = []

  // Extract job features
  const jobTitle = job.title.toLowerCase()
  const jobTags = job.tags?.toLowerCase().split(',').map((t: string) => t.trim()) || []
  const jobLocation = job.location?.toLowerCase() || ''
  const jobSalary = parseSalary(job.salary)
  const jobSeniority = job.seniorityLevel?.toLowerCase() || ''
  const jobCompany = job.company.toLowerCase()

  // 1. Skills matching (40% weight)
  if (userProfile.skills) {
    const matchingSkills = userProfile.skills.filter(skill =>
      jobTitle.includes(skill.toLowerCase()) ||
      jobTags.some((tag: string) => tag.includes(skill.toLowerCase()))
    )
    if (matchingSkills.length > 0) {
      score += 40 * (matchingSkills.length / userProfile.skills.length)
      reasons.push(`Matches ${matchingSkills.length} of your skills`)
    }
  }

  // 2. Role preference matching (25% weight)
  if (userProfile.preferredRoles) {
    const preferredRole = userProfile.preferredRoles.find(role =>
      jobTitle.includes(role.toLowerCase()) ||
      role.toLowerCase().includes(jobTitle.split(' ').slice(-2).join(' '))
    )
    if (preferredRole) {
      score += 25
      reasons.push('Matches your preferred role')
    }
  }

  // 3. Location preference (15% weight)
  if (userProfile.preferredLocations) {
    const preferredLocation = userProfile.preferredLocations.find(loc =>
      jobLocation.includes(loc.toLowerCase()) ||
      loc.toLowerCase().includes(jobLocation) ||
      job.remote
    )
    if (preferredLocation) {
      score += 15
      reasons.push(job.remote ? 'Remote position' : `Preferred location: ${job.location}`)
    }
  }

  // 4. Salary range matching (10% weight)
  if (userProfile.salaryMin && userProfile.salaryMax && jobSalary) {
    if (jobSalary >= userProfile.salaryMin && jobSalary <= userProfile.salaryMax) {
      score += 10
      reasons.push('Within your salary range')
    } else if (jobSalary > userProfile.salaryMax) {
      score += 5
      reasons.push('Above your salary range')
    }
  }

  // 5. Experience level matching (5% weight)
  if (userProfile.experience && userProfile.experience.length > 0) {
    const avgExperience = userProfile.experience.length
    let expectedLevel = 'entry'
    if (avgExperience >= 8) expectedLevel = 'senior'
    else if (avgExperience >= 5) expectedLevel = 'mid'
    else if (avgExperience >= 2) expectedLevel = 'junior'

    if (jobSeniority.includes(expectedLevel)) {
      score += 5
      reasons.push('Matches your experience level')
    }
  }

  // 6. User behavior patterns (5% weight)
  const savedJobs = userHistory.filter(h => h.type === 'saved')
  const appliedJobs = userHistory.filter(h => h.type === 'applied')

  // Check if user has similar saved/applied jobs
  const similarSaved = savedJobs.some((history: any) => {
    const historyTitle = history.jobTitle.toLowerCase()
    const historyTags = history.tags?.toLowerCase().split(',').map((t: string) => t.trim()) || []

    // Calculate Jaccard similarity
    const jobTagsSet = new Set(jobTags)
    const historyTagsSet = new Set(historyTags)
    const intersection = new Set([...jobTagsSet].filter(x => historyTagsSet.has(x)))
    const union = new Set([...jobTagsSet, ...historyTagsSet])
    const similarity = intersection.size / union.size

    return similarity > 0.3 || historyTitle.split(' ').some((word: string) => jobTitle.includes(word))
  })

  if (similarSaved) {
    score += 5
    reasons.push('Similar to jobs you\'ve saved')
  }

  // 7. Recency bonus (up to 5%)
  const daysSincePosted = Math.floor((Date.now() - new Date(job.postedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSincePosted <= 7) {
    score += Math.max(0, 5 - daysSincePosted * 0.5)
    reasons.push('Recently posted')
  }

  // 8. Company quality indicators (bonus points)
  const qualityIndicators = [
    { condition: job.company.includes('Coinbase'), reason: 'Top-tier company' },
    { condition: job.company.includes('Uniswap'), reason: 'Leading DeFi protocol' },
    { condition: job.company.includes('Chainlink'), reason: 'Established oracle provider' },
    { condition: jobTitle.includes('senior') && (jobSalary || 0) > 150000, reason: 'High-paying senior role' },
    { condition: jobTags.includes('rust') || jobTags.includes('solidity'), reason: 'In-demand blockchain skills' }
  ]

  qualityIndicators.forEach(({ condition, reason }) => {
    if (condition) {
      score += 2
      reasons.push(reason)
    }
  })

  // Normalize score to 0-100
  score = Math.min(100, Math.round(score))

  return {
    jobId: job.id,
    score,
    reasons: reasons.slice(0, 4) // Top 4 reasons
  }
}

function parseSalary(salaryString: string | null): number | null {
  if (!salaryString) return null

  // Extract numbers from salary string
  const match = salaryString.match(/\$?(\d+(?:,\d+)*)/g)
  if (!match) return null

  // Convert to number and handle k notation
  const numbers = match.map(m => {
    const num = parseInt(m.replace(/[$,k]/g, ''))
    return m.toLowerCase().includes('k') ? num * 1000 : num
  })

  // Return average for ranges
  return numbers.length > 0 ? Math.round(numbers.reduce((a, b) => a + b) / numbers.length) : null
}

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let userId: string
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = decoded.userId
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        skills: true,
        preferredRoles: true,
        preferredLocations: true,
        salaryMin: true,
        salaryMax: true,
        experience: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Parse user profile data
    const userProfile: UserProfile = {
      skills: user.skills ? JSON.parse(user.skills) : [],
      preferredRoles: user.preferredRoles ? JSON.parse(user.preferredRoles) : [],
      preferredLocations: user.preferredLocations ? JSON.parse(user.preferredLocations) : [],
      salaryMin: user.salaryMin || undefined,
      salaryMax: user.salaryMax || undefined,
      experience: user.experience ? JSON.parse(user.experience) : []
    }

    // Get user's job history (saved and applied jobs)
    const [savedJobsRaw, appliedJobs] = await Promise.all([
      prisma.savedJob.findMany({
        where: { userId },
        select: {
          jobId: true,
          savedAt: true
        }
      }),
      prisma.application.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true
            }
          }
        }
      })
    ])

    // Fetch job details for saved jobs
    const savedJobIds = savedJobsRaw.map(sj => sj.jobId)
    const savedJobsDetails = await prisma.job.findMany({
      where: { id: { in: savedJobIds } },
      select: {
        id: true,
        title: true,
        tags: true,
        company: true,
        description: true
      }
    })

    // Combine user history
    const userHistory = [
      ...savedJobsDetails.map(job => ({ ...job, type: 'saved' })),
      ...appliedJobs.map(aj => ({ jobTitle: 'Applied Job', type: 'applied' }))
    ]

    // Get recent jobs (excluding already applied/saved)
    const recentJobs = await prisma.job.findMany({
      where: {
        postedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: {
        postedAt: 'desc'
      },
      take: 100
    })

    // Calculate scores for each job
    const jobScores: JobSimilarity[] = recentJobs.map(job =>
      calculateJobScore(job, userProfile, userHistory)
    )

    // Filter and sort by score
    const recommendedJobs = jobScores
      .filter(js => js.score > 20) // Only show relevant recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Top 20 recommendations

    // Get full job details for recommendations
    const recommendedJobIds = recommendedJobs.map(rj => rj.jobId)
    const jobs = await prisma.job.findMany({
      where: {
        id: {
          in: recommendedJobIds
        }
      },
      orderBy: {
        postedAt: 'desc'
      }
    })

    // Combine jobs with their scores and reasons
    const recommendations = jobs.map(job => {
      const scoreData = recommendedJobs.find(rj => rj.jobId === job.id)!
      return {
        ...job,
        recommendationScore: scoreData.score,
        recommendationReasons: scoreData.reasons
      }
    }).sort((a, b) => b.recommendationScore - a.recommendationScore)

    return NextResponse.json({
      recommendations,
      total: recommendations.length,
      userProfile: {
        hasSkills: (userProfile.skills || []).length > 0,
        hasPreferences: (userProfile.preferredRoles || []).length > 0 || (userProfile.preferredLocations || []).length > 0
      }
    })

  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}