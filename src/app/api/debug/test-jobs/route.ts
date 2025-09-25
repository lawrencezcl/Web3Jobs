import { fetchLever } from '../../../lib/connectors/lever'
import { fetchGreenhouse } from '../../../lib/connectors/greenhouse'
import { fetchRemoteOK } from '../../../lib/connectors/remoteok'
import { fetchRSS } from '../../../lib/connectors/rss'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const results = {}

  try {
    // Test Lever
    const leverJobs = await fetchLever('ledger')
    results['lever'] = {
      company: 'ledger',
      count: leverJobs.length,
      firstJob: leverJobs[0] ? {
        title: leverJobs[0].title,
        company: leverJobs[0].company,
        location: leverJobs[0].location,
        url: leverJobs[0].url,
        id: leverJobs[0].id
      } : null
    }
  } catch (error) {
    results['lever'] = { error: error.message }
  }

  try {
    // Test Greenhouse
    const greenhouseJobs = await fetchGreenhouse('ripple')
    results['greenhouse'] = {
      board: 'ripple',
      count: greenhouseJobs.length,
      firstJob: greenhouseJobs[0] ? {
        title: greenhouseJobs[0].title,
        company: greenhouseJobs[0].company,
        location: greenhouseJobs[0].location,
        url: greenhouseJobs[0].url,
        id: greenhouseJobs[0].id
      } : null
    }
  } catch (error) {
    results['greenhouse'] = { error: error.message }
  }

  try {
    // Test RemoteOK
    const remoteJobs = await fetchRemoteOK()
    results['remoteok'] = {
      count: remoteJobs.length,
      firstJob: remoteJobs[0] ? {
        title: remoteJobs[0].title,
        company: remoteJobs[0].company,
        location: remoteJobs[0].location,
        url: remoteJobs[0].url,
        id: remoteJobs[0].id
      } : null
    }
  } catch (error) {
    results['remoteok'] = { error: error.message }
  }

  return Response.json(results)
}