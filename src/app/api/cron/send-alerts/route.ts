import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface JobAlertData {
  email: string
  frequency: string
  keywords: string[]
  tags: string[]
  remote: boolean
}

export async function GET(request: NextRequest) {
  try {
    // Get all email subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        type: 'email'
      }
    })

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No email subscriptions found',
        sent: 0
      })
    }

    let sentCount = 0
    const errors: string[] = []

    for (const subscription of subscriptions) {
      try {
        const metadata = subscription.metadata as any || {}
        const alertData: JobAlertData = {
          email: subscription.identifier,
          frequency: metadata.frequency || 'daily',
          keywords: metadata.keywords || [],
          tags: metadata.tags || [],
          remote: metadata.remote !== false
        }

        // Check if it's time to send (daily frequency)
        if (alertData.frequency === 'daily') {
          const success = await sendJobAlert(alertData)
          if (success) sentCount++
        }
      } catch (error) {
        console.error(`Failed to send alert to ${subscription.identifier}:`, error)
        errors.push(subscription.identifier)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${subscriptions.length} subscriptions`,
      sent: sentCount,
      errors: errors.length,
      errorEmails: errors
    })

  } catch (error) {
    console.error('Job alerts cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendJobAlert(alertData: JobAlertData): Promise<boolean> {
  try {
    // Build search query based on user preferences
    const searchParams = new URLSearchParams({
      limit: '10',
      page: '1'
    })

    if (alertData.remote) {
      searchParams.append('remote', 'true')
    }

    // Add keywords to search
    if (alertData.keywords.length > 0) {
      searchParams.append('q', alertData.keywords.join(' '))
    }

    // Add tags to search
    if (alertData.tags.length > 0) {
      searchParams.append('tag', alertData.tags.join(','))
    }

    // Get jobs from yesterday to today
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    searchParams.append('dateRange', 'today')

    // Fetch matching jobs
    const jobsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.remotejobs.top'}/api/jobs?${searchParams.toString()}`,
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Web3-Jobs-Alert-System/1.0'
        }
      }
    )

    if (!jobsResponse.ok) {
      throw new Error(`Failed to fetch jobs: ${jobsResponse.status}`)
    }

    const jobsData = await jobsResponse.json()
    const jobs = jobsData.items || []

    if (jobs.length === 0) {
      // No jobs to send, but still send an email periodically
      if (Math.random() < 0.1) { // 10% chance to send "no jobs" email
        await sendNoJobsEmail(alertData)
      }
      return true
    }

    // Send jobs email
    await sendJobsEmail(alertData, jobs)
    return true

  } catch (error) {
    console.error(`Failed to send job alert to ${alertData.email}:`, error)
    return false
  }
}

async function sendJobsEmail(alertData: JobAlertData, jobs: any[]) {
  const jobsHtml = jobs.map(job => `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea;">
      <h3 style="color: #334155; margin: 0 0 8px 0; font-size: 18px;">
        <a href="https://www.remotejobs.top/jobs/${job.id}"
           style="color: #667eea; text-decoration: none; font-weight: 600;">
          ${job.title}
        </a>
      </h3>

      <div style="color: #64748b; margin-bottom: 12px;">
        <strong style="color: #334155;">${job.company}</strong>
        ${job.location ? ` • ${job.location}` : ''}
        ${job.remote ? ' • 🌍 Remote' : ''}
      </div>

      ${job.salary ? `
        <div style="color: #10b981; font-weight: 500; margin-bottom: 8px;">
          💰 ${job.salary}
        </div>
      ` : ''}

      ${job.tags ? `
        <div style="margin-bottom: 12px;">
          ${job.tags.split(',').filter(Boolean).slice(0, 3).map(tag =>
            `<span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 6px;">
              ${tag.trim()}
            </span>`
          ).join('')}
        </div>
      ` : ''}

      <div style="text-align: right;">
        <a href="${job.url}" target="_blank"
           style="background: #667eea; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Apply Now →
        </a>
      </div>
    </div>
  `).join('')

  await resend.emails.send({
    from: 'Web3 Jobs <jobs@remotejobs.top>',
    to: alertData.email,
    subject: `🚀 ${jobs.length} New Web3 Jobs Found!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🚀 Web3 Jobs Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${jobs.length} new opportunities found!</p>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 25px;">
            Here are the latest Web3 opportunities matching your preferences:
          </p>

          ${jobsHtml}

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.remotejobs.top/jobs"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; padding: 15px 30px; text-decoration: none;
                      border-radius: 25px; display: inline-block; font-weight: bold;">
              View All Jobs
            </a>
          </div>

          <div style="margin-top: 25px; padding: 15px; background: #e0f2fe; border-radius: 8px;">
            <p style="color: #0369a1; font-size: 14px; margin: 0;">
              <strong>Your preferences:</strong>
              ${alertData.keywords.length > 0 ? alertData.keywords.join(', ') : 'All keywords'}
              ${alertData.remote ? ' • Remote only' : ''}
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 25px;">
            Want to change your preferences? <a href="https://www.remotejobs.top" style="color: #667eea;">Visit our site</a>
          </p>
        </div>
      </div>
    `
  })
}

async function sendNoJobsEmail(alertData: JobAlertData) {
  await resend.emails.send({
    from: 'Web3 Jobs <jobs@remotejobs.top>',
    to: alertData.email,
    subject: '📊 Web3 Jobs Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">📊 Web3 Jobs Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">No new jobs matching your criteria today</p>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 25px;">
            We didn't find any new jobs matching your specific preferences today, but new opportunities are posted regularly. Here are some trending searches:
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px;">
            <a href="https://www.remotejobs.top/jobs?q=solidity" style="background: white; padding: 15px; border-radius: 8px; text-decoration: none; color: #334155; border: 1px solid #e2e8f0;">
              <strong>Solidity Developer</strong>
              <div style="color: #64748b; font-size: 14px;">150+ jobs</div>
            </a>
            <a href="https://www.remotejobs.top/jobs?q=defi" style="background: white; padding: 15px; border-radius: 8px; text-decoration: none; color: #334155; border: 1px solid #e2e8f0;">
              <strong>DeFi Engineer</strong>
              <div style="color: #64748b; font-size: 14px;">85+ jobs</div>
            </a>
            <a href="https://www.remotejobs.top/jobs?q=blockchain" style="background: white; padding: 15px; border-radius: 8px; text-decoration: none; color: #334155; border: 1px solid #e2e8f0;">
              <strong>Blockchain Developer</strong>
              <div style="color: #64748b; font-size: 14px;">200+ jobs</div>
            </a>
            <a href="https://www.remotejobs.top/jobs?q=web3" style="background: white; padding: 15px; border-radius: 8px; text-decoration: none; color: #334155; border: 1px solid #e2e8f0;">
              <strong>Web3 Developer</strong>
              <div style="color: #64748b; font-size: 14px;">300+ jobs</div>
            </a>
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="https://www.remotejobs.top/jobs"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; padding: 15px 30px; text-decoration: none;
                      border-radius: 25px; display: inline-block; font-weight: bold;">
              Browse All Jobs
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 25px;">
            <a href="https://www.remotejobs.top/unsubscribe?email=${alertData.email}" style="color: #94a3b8;">Unsubscribe</a> |
            <a href="https://www.remotejobs.top" style="color: #667eea;">Update Preferences</a>
          </p>
        </div>
      </div>
    `
  })
}