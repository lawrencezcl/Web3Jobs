import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, topics, frequency = 'daily' } = await request.json()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate topics
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: 'At least one topic is required' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.jobAlert.findUnique({
      where: {
        email_topics: {
          email,
          topics: topics.join(',')
        }
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription already exists' },
        { status: 409 }
      )
    }

    // Create new subscription
    const subscription = await prisma.jobAlert.create({
      data: {
        email,
        topics: topics.join(','),
        frequency,
        isActive: true,
        lastSent: new Date()
      }
    })

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Web3 Jobs <alerts@remotejobs.top>',
        to: [email],
        subject: '🚀 Your Web3 Job Alert Subscription is Active!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Web3 Jobs Alert Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 2.5em;">🚀</h1>
                <h2 style="color: white; margin: 10px 0 0 0;">Your Web3 Job Alert is Active!</h2>
              </div>

              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #667eea; margin-top: 0;">Welcome to Web3 Jobs!</h3>
                <p>You've successfully subscribed to job alerts for the following topics:</p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <strong>Your Topics:</strong><br>
                  ${topics.map(topic => `<span style="display: inline-block; background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; margin: 5px 5px 5px 0; font-size: 0.9em;">${topic}</span>`).join('')}
                </div>

                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                  <strong>📧 Delivery Frequency:</strong> ${frequency}<br>
                  <strong>🎯 First Alert:</strong> You'll receive your first alert within 24 hours
                </div>

                <h4 style="color: #667eea; margin-top: 30px;">What to Expect:</h4>
                <ul style="text-align: left;">
                  <li>Curated Web3 job opportunities matching your interests</li>
                  <li>Remote and on-site positions from top companies</li>
                  <li>Smart contract developer, DeFi engineer, and blockchain roles</li>
                  <li>Early access to the hottest opportunities</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.remotejobs.top" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Browse All Jobs</a>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                <p style="font-size: 0.9em; color: #666; text-align: center;">
                  You can manage your subscription preferences or unsubscribe at any time.<br>
                  Questions? Reply to this email or contact <a href="mailto:support@remotejobs.top">support@remotejobs.top</a>
                </p>
              </div>
            </body>
          </html>
        `
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Job alert subscription created successfully',
      subscription: {
        id: subscription.id,
        email: subscription.email,
        topics: subscription.topics.split(','),
        frequency: subscription.frequency
      }
    })

  } catch (error) {
    console.error('Error creating job alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const subscriptions = await prisma.jobAlert.findMany({
      where: { email, isActive: true },
      select: {
        id: true,
        topics: true,
        frequency: true,
        createdAt: true,
        lastSent: true
      }
    })

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        ...sub,
        topics: sub.topics.split(',')
      }))
    })

  } catch (error) {
    console.error('Error fetching job alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email, topics } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (topics) {
      // Unsubscribe from specific topics
      await prisma.jobAlert.deleteMany({
        where: {
          email,
          topics: { in: topics.join(',') }
        }
      })
    } else {
      // Unsubscribe from all topics
      await prisma.jobAlert.updateMany({
        where: { email },
        data: { isActive: false }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully'
    })

  } catch (error) {
    console.error('Error unsubscribing from job alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}