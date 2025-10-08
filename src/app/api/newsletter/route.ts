import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const resend = process.env.RESEND_API_KEY ? new (require('resend').Resend)(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email, frequency = 'daily', keywords = [], tags = [], remote = true } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        identifier: email,
        type: 'email'
      }
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          topics: `${keywords.join(',')},${tags.join(',')}`,
          frequency: frequency || 'daily',
          metadata: JSON.stringify({
            remote,
            keywords,
            tags,
            updatedAt: new Date().toISOString()
          })
        }
      })
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          type: 'email',
          email: email,
          identifier: email,
          topics: `${keywords.join(',')},${tags.join(',')}`,
          frequency: frequency || 'daily',
          metadata: JSON.stringify({
            remote,
            keywords,
            tags,
            createdAt: new Date().toISOString()
          })
        }
      })
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Web3 Jobs <notifications@remotejobs.top>',
        to: email,
        subject: '✅ Your Web3 Jobs Alert is Active',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🚀 Web3 Jobs Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your alert is now active!</p>
            </div>

            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #334155; margin-bottom: 20px;">Welcome to Web3 Jobs! 🎉</h2>

              <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
                Thank you for subscribing to our Web3 job alerts. You'll receive the latest
                blockchain, cryptocurrency, and DeFi opportunities straight to your inbox.
              </p>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #334155; margin-bottom: 15px;">📧 Your Alert Settings:</h3>
                <ul style="color: #64748b; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Frequency:</strong> ${frequency}</li>
                  <li><strong>Remote Jobs Only:</strong> ${remote ? 'Yes' : 'No'}</li>
                  ${keywords.length > 0 ? `<li><strong>Keywords:</strong> ${keywords.join(', ')}</li>` : ''}
                  ${tags.length > 0 ? `<li><strong>Tags:</strong> ${tags.join(', ')}</li>` : ''}
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.remotejobs.top"
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          color: white; padding: 15px 30px; text-decoration: none;
                          border-radius: 25px; display: inline-block; font-weight: bold;">
                  Browse Jobs Now
                </a>
              </div>

              <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 30px;">
                You can unsubscribe at any time by clicking the link in our emails.
              </p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to job alerts',
      email,
      frequency,
      keywords,
      tags
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const deletedSubscription = await prisma.subscription.deleteMany({
      where: {
        identifier: email,
        type: 'email'
      }
    })

    if (deletedSubscription.count === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from job alerts'
    })

  } catch (error) {
    console.error('Newsletter unsubscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}