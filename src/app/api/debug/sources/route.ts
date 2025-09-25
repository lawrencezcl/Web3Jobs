import { fetchLever } from '../../../../lib/connectors/lever'
import { fetchGreenhouse } from '../../../../lib/connectors/greenhouse'
import { fetchRemoteOK } from '../../../../lib/connectors/remoteok'
import { fetchRSS } from '../../../../lib/connectors/rss'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')

  try {
    let result = {}

    switch (source) {
      case 'lever':
        console.log('Testing Lever...')
        result = { source: 'lever', data: await fetchLever('ledger') }
        break
      case 'greenhouse':
        console.log('Testing Greenhouse...')
        result = { source: 'greenhouse', data: await fetchGreenhouse('consensys') }
        break
      case 'remoteok':
        console.log('Testing RemoteOK...')
        result = { source: 'remoteok', data: await fetchRemoteOK() }
        break
      case 'rss':
        console.log('Testing RSS...')
        result = { source: 'rss', data: await fetchRSS('https://web3.career/jobs.rss', 'rss') }
        break
      default:
        return Response.json({ error: 'Invalid source' }, { status: 400 })
    }

    return Response.json({
      success: true,
      source,
      jobCount: Array.isArray(result.data) ? result.data.length : 0,
      sampleJobs: Array.isArray(result.data) ? result.data.slice(0, 2) : []
    })
  } catch (error) {
    console.error(`Error testing ${source}:`, error)
    return Response.json({
      success: false,
      source,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}