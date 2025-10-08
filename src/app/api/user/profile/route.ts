import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  github: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  resumeUrl: z.string().url('Invalid resume URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  jobSeeking: z.boolean().optional(),
  preferredRoles: z.string().optional(),
  preferredLocations: z.string().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().optional(),
  noticePeriod: z.number().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, email: decoded.email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        twitter: true,
        linkedin: true,
        skills: true,
        experience: true,
        education: true,
        resumeUrl: true,
        portfolioUrl: true,
        jobSeeking: true,
        preferredRoles: true,
        preferredLocations: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        noticePeriod: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user statistics
    const [applicationsCount, savedJobsCount, jobAlertsCount] = await Promise.all([
      prisma.application.count({ where: { userId: user.id } }),
      prisma.savedJob.count({ where: { userId: user.id } }),
      prisma.jobAlert.count({ where: { userId: user.id, isActive: true } }),
    ])

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          applications: applicationsCount,
          savedJobs: savedJobsCount,
          jobAlerts: jobAlertsCount,
        }
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId, email: decoded.email },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        github: true,
        twitter: true,
        linkedin: true,
        skills: true,
        experience: true,
        education: true,
        resumeUrl: true,
        portfolioUrl: true,
        jobSeeking: true,
        preferredRoles: true,
        preferredLocations: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        noticePeriod: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })

  } catch (error) {
    console.error('Update profile error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}