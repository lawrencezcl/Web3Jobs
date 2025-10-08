import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

const createApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  followUpAt: z.string().datetime().optional(),
})

const updateApplicationSchema = z.object({
  status: z.enum(['applied', 'interviewing', 'offered', 'rejected', 'withdrawn']).optional(),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
  followUpAt: z.string().datetime().optional(),
  employerResponse: z.string().optional(),
  salaryOffered: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'appliedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = { userId: decoded.userId }
    if (status) {
      where.status = status
    }

    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          // Note: We don't have a direct relation to Job in the schema
          // In a real implementation, you'd want to fetch job details
        },
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const body = await request.json()
    const validatedData = createApplicationSchema.parse(body)

    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: decoded.userId,
        jobId: validatedData.jobId,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: decoded.userId,
        ...validatedData,
        followUpAt: validatedData.followUpAt ? new Date(validatedData.followUpAt) : null,
      },
    })

    return NextResponse.json({
      success: true,
      application,
    })

  } catch (error) {
    console.error('Create application error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

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
    const { applicationId, ...updateData } = body

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    const validatedData = updateApplicationSchema.parse(updateData)

    // Update application
    const application = await prisma.application.update({
      where: {
        id: applicationId,
        userId: decoded.userId, // Ensure user can only update their own applications
      },
      data: {
        ...validatedData,
        followUpAt: validatedData.followUpAt ? new Date(validatedData.followUpAt) : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      application,
    })

  } catch (error) {
    console.error('Update application error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    // Delete application
    await prisma.application.delete({
      where: {
        id: applicationId,
        userId: decoded.userId, // Ensure user can only delete their own applications
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    })

  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}