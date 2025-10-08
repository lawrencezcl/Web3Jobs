import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

const submitVerificationSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  companyName: z.string().min(2, 'Company name is required'),
  website: z.string().url('Invalid website URL'),
  contactEmail: z.string().email('Invalid contact email'),
  contactName: z.string().min(2, 'Contact name is required'),
  companySize: z.string().min(1, 'Company size is required'),
  industry: z.string().min(1, 'Industry is required'),
  founded: z.number().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  hqLocation: z.string().min(2, 'HQ location is required'),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
  }).optional(),
  documents: z.object({
    businessLicense: z.string().url().optional(),
    certificate: z.string().url().optional(),
    taxDocument: z.string().url().optional(),
  }).optional(),
  additionalInfo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    const body = await request.json()
    const validatedData = submitVerificationSchema.parse(body)

    // Check if company exists
    let company = await prisma.company.findUnique({
      where: { slug: validatedData.companyId.toLowerCase() }
    })

    if (!company) {
      // Create new company record
      company = await prisma.company.create({
        data: {
          name: validatedData.companyName,
          slug: validatedData.companyId.toLowerCase(),
          website: validatedData.website,
          industry: validatedData.industry,
          size: validatedData.companySize,
          location: validatedData.hqLocation,
          founded: validatedData.founded,
          description: validatedData.description,
          social: JSON.stringify(validatedData.socialLinks || {}),
          verified: false, // Will be set to true after verification
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        companyId: company.id,
        userId: decoded.userId,
        companyName: validatedData.companyName,
        website: validatedData.website,
        contactEmail: validatedData.contactEmail,
        contactName: validatedData.contactName,
        companySize: validatedData.companySize,
        industry: validatedData.industry,
        founded: validatedData.founded,
        description: validatedData.description,
        hqLocation: validatedData.hqLocation,
        socialLinks: JSON.stringify(validatedData.socialLinks || {}),
        documents: JSON.stringify(validatedData.documents || {}),
        additionalInfo: validatedData.additionalInfo,
        status: 'pending',
        submittedAt: new Date(),
      },
    })

    // TODO: Send notification email to verification team
    // TODO: Send confirmation email to submitter

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      requestId: verificationRequest.id,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        verificationStatus: 'pending',
      },
    })

  } catch (error) {
    console.error('Company verification submission error:', error)

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
    const companyId = searchParams.get('companyId')
    const userId = searchParams.get('userId')

    if (companyId) {
      // Get verification status for a specific company
      const company = await prisma.company.findUnique({
        where: { slug: companyId.toLowerCase() },
        select: {
          id: true,
          name: true,
          slug: true,
          verified: true,
          logo: true,
          website: true,
          industry: true,
          size: true,
          location: true,
          founded: true,
          description: true,
        },
      })

      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }

      // Get latest verification request
      const verificationRequest = await prisma.verificationRequest.findFirst({
        where: { companyId: company.id },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
          reviewedBy: true,
          reviewNotes: true,
        },
      })

      return NextResponse.json({
        success: true,
        company: {
          ...company,
          verificationStatus: company.verified ? 'verified' : (verificationRequest?.status || 'none'),
          verificationRequest: verificationRequest ? {
            id: verificationRequest.id,
            status: verificationRequest.status,
            submittedAt: verificationRequest.submittedAt,
            reviewedAt: verificationRequest.reviewedAt,
            reviewNotes: verificationRequest.reviewNotes,
          } : null,
        },
      })
    }

    if (userId) {
      // Verify authentication
      const token = request.cookies.get('auth-token')?.value
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

      // Get verification requests for a user
      const verificationRequests = await prisma.verificationRequest.findMany({
        where: { userId: decoded.userId },
        select: {
          id: true,
          companyId: true,
          companyName: true,
          status: true,
          submittedAt: true,
          reviewedAt: true,
        },
        orderBy: { submittedAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        verificationRequests,
      })
    }

    return NextResponse.json(
      { error: 'Company ID or User ID is required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}