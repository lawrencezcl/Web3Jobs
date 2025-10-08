import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface UnsubscribeRequest {
  subscription: {
    endpoint: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UnsubscribeRequest = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Here you would remove from database
    // For demo purposes, we'll just log it
    console.log('Push subscription removed:', subscription.endpoint)

    // In a real implementation:
    // await prisma.pushSubscription.deleteMany({
    //   where: {
    //     endpoint: subscription.endpoint
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from notifications'
    })

  } catch (error) {
    console.error('Push unsubscription error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from notifications' },
      { status: 500 }
    )
  }
}