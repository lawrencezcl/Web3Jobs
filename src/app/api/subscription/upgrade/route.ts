import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'
const resend = process.env.RESEND_API_KEY ? new (require('resend').Resend)(process.env.RESEND_API_KEY) : null

interface SubscriptionPlan {
  name: string
  price: number
  period: 'month' | 'year'
  maxJobs: number
  features: string[]
}

const PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    name: 'Starter',
    price: 0,
    period: 'month',
    maxJobs: 3,
    features: ['3 job postings per month', 'Basic company profile']
  },
  professional: {
    name: 'Professional',
    price: 199,
    period: 'month',
    maxJobs: 15,
    features: ['15 job postings per month', 'Enhanced company profile', 'Company verification']
  },
  enterprise: {
    name: 'Enterprise',
    price: 599,
    period: 'month',
    maxJobs: -1,
    features: ['Unlimited job postings', 'Premium features', 'Dedicated support']
  }
}

export async function POST(request: NextRequest) {
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

    const { planId, paymentMethodId, billingCycle } = await request.json()

    if (!planId || !PLANS[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const plan = PLANS[planId]
    const amount = billingCycle === 'year' ? plan.price * 10 : plan.price

    // TODO: Update Subscription model schema to support plan fields
    // For now, return a mock subscription object
    const subscription = {
      id: 'mock_' + Date.now(),
      userId: userId,
      plan: planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(
        Date.now() + (billingCycle === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000
      ),
      cancelAtPeriodEnd: false
    }

    // Create payment record
    const payment = await prisma.paymentRecord.create({
      data: {
        jobId: 'subscription_' + planId,
        userId: userId,
        amount: amount,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'stripe',
        paymentMethodId: paymentMethodId,
        paidAt: new Date()
      }
    })

    // Send confirmation email
    if (user.email) {
      try {
        await resend.emails.send({
          from: 'Web3 Jobs <noreply@remotejobs.top>',
          to: [user.email],
          subject: `Subscription Updated to ${plan.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Subscription Updated Successfully! 🎉</h2>
              <p>Hi ${user.name || 'there'},</p>
              <p>Your subscription has been updated to the <strong>${plan.name}</strong> plan.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Plan Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li>Plan: ${plan.name}</li>
                  <li>Price: $${amount} ${billingCycle === 'year' ? '/year' : '/month'}</li>
                  <li>Max Job Postings: ${plan.maxJobs === -1 ? 'Unlimited' : plan.maxJobs}</li>
                </ul>
              </div>
              
              <p>You can now start posting jobs with your new benefits.</p>
              <a href="https://www.remotejobs.top/employer/post" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Post a Job Now
              </a>
              
              <p>Best regards,<br/>The Web3 Jobs Team</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        plan: plan.name,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        maxJobs: plan.maxJobs,
        features: plan.features
      },
      payment: {
        id: payment.id,
        amount: amount,
        currency: 'USD'
      }
    })

  } catch (error) {
    console.error('Subscription upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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

    // Get current subscription (using findFirst since userId is not unique)
    const subscription = await prisma.subscription.findFirst({
      where: { userId: userId }
    })

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: 'starter',
        availablePlans: PLANS
      })
    }

    // TODO: Implement proper usage tracking when schema is updated
    const jobCount = 0
    const paymentCount = 1

    // For now, use default starter plan
    const plan = PLANS.starter
    const jobsRemaining = plan.maxJobs === -1 ? -1 : Math.max(0, plan.maxJobs - jobCount)

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: 'starter', // Default plan
        planName: plan.name,
        status: 'active', // Default status
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        maxJobs: plan.maxJobs,
        jobsUsed: jobCount,
        jobsRemaining: jobsRemaining,
        features: plan.features
      },
      availablePlans: PLANS,
      billingHistory: {
        paymentsThisPeriod: paymentCount
      }
    })

  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}