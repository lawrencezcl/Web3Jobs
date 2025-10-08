import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

const createFeaturedJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  company: z.string().min(2, 'Company name is required'),
  location: z.string().optional(),
  remote: z.boolean().default(true),
  tags: z.string().optional(),
  url: z.string().url('Invalid job URL'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  salary: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  employmentType: z.string().optional(),
  seniorityLevel: z.string().optional(),
  applicationDeadline: z.string().datetime().optional(),
  featuredUntil: z.string().datetime().optional(),
  featuredTier: z.enum(['basic', 'premium', 'enterprise']).default('basic'),
  highlights: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
})

const PRICING_TIERS = {
  basic: {
    price: 199,
    duration: 30, // days
    features: ['featured listing', 'priority placement', 'company logo'],
  },
  premium: {
    price: 499,
    duration: 60,
    features: ['enhanced listing', 'top placement', 'social media promotion', 'company profile'],
  },
  enterprise: {
    price: 999,
    duration: 90,
    features: ['premium placement', 'dedicated support', 'analytics dashboard', 'unlimited edits'],
  },
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
    const validatedData = createFeaturedJobSchema.parse(body)

    // Calculate pricing and duration
    const tier = PRICING_TIERS[validatedData.featuredTier]
    const featuredUntil = validatedData.featuredUntil
      ? new Date(validatedData.featuredUntil)
      : new Date(Date.now() + tier.duration * 24 * 60 * 60 * 1000)

    // Create featured job posting
    const featuredJob = await prisma.job.create({
      data: {
        ...validatedData,
        postedAt: new Date(),
        createdAt: new Date(),
        // Additional fields for featured jobs
        featuredUntil: featuredUntil,
        featuredTier: validatedData.featuredTier,
        featuredPrice: tier.price,
        featuredStatus: 'pending_payment', // pending_payment, active, expired
        // Store additional data in description or as JSON
        description: JSON.stringify({
          description: validatedData.description,
          highlights: validatedData.highlights || [],
          requirements: validatedData.requirements || [],
          benefits: validatedData.benefits || [],
        }),
      },
    })

    // Create payment record (in real implementation, you'd integrate with Stripe/PayPal)
    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        jobId: featuredJob.id,
        userId: decoded.userId,
        amount: tier.price,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'stripe',
        createdAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      featuredJob: {
        ...featuredJob,
        featuredUntil: featuredUntil.toISOString(),
        pricing: {
          tier: validatedData.featuredTier,
          price: tier.price,
          duration: tier.duration,
          features: tier.features,
        },
      },
      payment: {
        id: paymentRecord.id,
        amount: tier.price,
        currency: 'USD',
        status: 'pending',
      },
    })

  } catch (error) {
    console.error('Featured job creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'
    const tier = searchParams.get('tier')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause for featured jobs
    const where: any = {
      featuredStatus: status,
      featuredUntil: {
        gte: new Date(), // Only show active featured jobs
      },
    }

    if (tier) {
      where.featuredTier = tier
    }

    // Get featured jobs
    const featuredJobs = await prisma.job.findMany({
      where,
      orderBy: [
        { featuredTier: 'desc' }, // enterprise > premium > basic
        { featuredUntil: 'asc' }, // newer postings first
        { createdAt: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        remote: true,
        tags: true,
        url: true,
        salary: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        employmentType: true,
        seniorityLevel: true,
        postedAt: true,
        createdAt: true,
        featuredUntil: true,
        featuredTier: true,
        featuredPrice: true,
        featuredStatus: true,
      },
    })

    // Parse description JSON for additional fields
    const formattedJobs = featuredJobs.map(job => {
      let parsedDescription = { description: job.description, highlights: [], requirements: [], benefits: [] }
      try {
        parsedDescription = JSON.parse(job.description || '{}')
      } catch (e) {
        // Keep original if JSON parsing fails
      }

      return {
        ...job,
        description: parsedDescription.description || job.description,
        highlights: parsedDescription.highlights || [],
        requirements: parsedDescription.requirements || [],
        benefits: parsedDescription.benefits || [],
        postedAt: job.postedAt?.toISOString(),
        createdAt: job.createdAt.toISOString(),
        featuredUntil: job.featuredUntil?.toISOString(),
        daysLeft: job.featuredUntil
          ? Math.ceil((job.featuredUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0,
      }
    })

    return NextResponse.json({
      success: true,
      featuredJobs: formattedJobs,
      meta: {
        total: formattedJobs.length,
        status,
        tier,
        limit,
        generatedAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Get featured jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update featured job status
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const body = await request.json()
    const { jobId, status, featuredUntil, featuredTier } = body

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    // Update featured job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        featuredStatus: status,
        featuredUntil: featuredUntil ? new Date(featuredUntil) : undefined,
        featuredTier: featuredTier || undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      job: updatedJob,
    })

  } catch (error) {
    console.error('Update featured job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Payment processing (simplified)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, status, paymentMethodId } = body

    if (!paymentId || !status) {
      return NextResponse.json(
        { error: 'Payment ID and status are required' },
        { status: 400 }
      )
    }

    // Update payment record
    const payment = await prisma.paymentRecord.update({
      where: { id: paymentId },
      data: {
        status,
        paymentMethodId,
        paidAt: status === 'completed' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    })

    // If payment completed, activate the job
    if (status === 'completed') {
      await prisma.job.update({
        where: { id: payment.jobId },
        data: {
          featuredStatus: 'active',
          updatedAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      payment,
    })

  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}