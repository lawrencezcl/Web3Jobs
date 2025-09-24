import { NextRequest } from 'next/server'
import { searchMockJobs } from '@/lib/mock-data'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  const query = {
    q: searchParams.get('q') || '',
    tag: searchParams.get('tag') || '',
    remote: searchParams.get('remote') || 'true',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
    country: searchParams.get('country') || '',
    seniorityLevel: searchParams.get('seniorityLevel') || ''
  }

  try {
    const result = searchMockJobs(query)
    
    return Response.json({
      success: true,
      ...result,
      mock: true,
      message: 'This is mock data for UI/UX testing'
    })
  } catch (error) {
    console.error('Mock API error:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch mock data' },
      { status: 500 }
    )
  }
}