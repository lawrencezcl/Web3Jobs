import { sha256, parseTags } from '../utils'
import { config } from '../config'

type Job = {
  id: string; title: string; company: string; location?: string;
  remote: boolean; tags: string[]; url: string; source: string;
  postedAt?: Date | null; createdAt: Date; salary?: string | null;
  currency?: string | null; employmentType?: string | null; description?: string | null;
}

export async function fetchRemoteOK(): Promise<Job[]> {
  if (!config.enable_remoteok) return []

  const res = await fetch('https://remoteok.com/api', {
    headers: { 'User-Agent': 'web3-remote-jobs/1.0' }
  })
  if (!res.ok) return []

  const arr = await res.json() as any[]
  const data = Array.isArray(arr) ? arr.slice(1) : []
  const out: Job[] = []

  // Web3-related keywords for filtering
  const web3Keywords = [
    'web3', 'crypto', 'blockchain', 'bitcoin', 'ethereum', 'defi',
    'nft', 'smart contract', 'solidity', 'rust', 'solana', 'polygon',
    'chainlink', 'uniswap', 'chainalysis', 'coinbase', 'binance',
    'ledger', 'metamask', 'web3.js', 'ethers.js', 'truffle', 'hardhat'
  ]

  for (const j of data) {
    try {
      const tagsArr = Array.isArray(j.tags) ? j.tags : []
      const position = (j.position || '').toLowerCase()
      const description = (j.description || '').toLowerCase()

      // Check if job is Web3-related
      const isWeb3 = web3Keywords.some(keyword =>
        tagsArr.some((t: string) => t.toLowerCase().includes(keyword)) ||
        position.includes(keyword) ||
        description.includes(keyword)
      )

      if (!isWeb3) continue

      const title: string = j.position || 'Untitled'
      const company: string = j.company || 'Unknown'
      const href: string = j.url || j.apply_url || ''
      const location: string = String(j.location || '')
      const tags: string[] = parseTags(tagsArr)
      const postedAt = j.epoch ? new Date(Number(j.epoch)*1000) : null
      const id = sha256(`${title}|${company}|${href}`)

      // Extract additional information
      const salary = j.salary || null
      const cleanDescription = j.description ?
        String(j.description).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() : null

      out.push({
        id,
        title,
        company,
        location,
        remote: true,
        tags,
        url: href,
        source: 'remoteok',
        postedAt,
        createdAt: new Date(),
        salary,
        description: cleanDescription,
        employmentType: j.job_type || null
      })
    } catch (error) {
      console.warn('Error processing RemoteOK job:', error)
    }
  }
  return out
}
