'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

type Job = {
  id: string
  title: string
  company: string
  location?: string | null
  remote: boolean
  tags?: string | null
  url: string
  source: string
  postedAt?: string | null
  createdAt: string
}

export default function JobsPage() {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [remote, setRemote] = useState('true')
  const [items, setItems] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  async function search() {
    setLoading(true)
    const params = new URLSearchParams({ q, tag, remote, limit: '50', page: '1' })
    const res = await fetch('/api/jobs?' + params.toString())
    const data = await res.json()
    setItems(data.items || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { search() }, [])

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">🌐 Web3 Remote Jobs</h1>
      <p className="text-slate-400 mb-4">Auto-collected via Vercel Cron. Search below.</p>
      <div className="flex gap-2 mb-3">
        <Input placeholder="Search title/company/tags..." value={q} onChange={e=>setQ(e.target.value)} />
        <Input placeholder="Tag (e.g. solidity)" value={tag} onChange={e=>setTag(e.target.value)} />
        <select className="bg-slate-900 border border-slate-700 rounded-md px-3" value={remote} onChange={e=>setRemote(e.target.value)}>
          <option value="true">Remote</option>
          <option value="false">Onsite/Hybrid</option>
        </select>
        <Button onClick={search} disabled={loading}>{loading ? 'Loading…' : 'Search'}</Button>
      </div>
      <div className="text-slate-400 mb-2">Found {total} jobs</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(it => (
          <Card key={it.id} className="p-4 space-y-2">
            <Link href={`/jobs/${it.id}`} className="text-lg font-medium hover:underline block">
              {it.title}
            </Link>
            <div className="text-sm text-slate-400">{it.company} • {it.location || 'Remote'}</div>
            <div className="flex flex-wrap gap-1">
              {(it.tags || '').split(',').filter(Boolean).slice(0,6).map(t => <Badge key={t}>{t}</Badge>)}
              <Badge>{it.source}</Badge>
            </div>
            <div className="pt-2">
              <a href={it.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                Apply →
              </a>
            </div>
          </Card>
        ))}
      </div>
      <footer className="py-8 text-center text-slate-500">Built with Next.js + Neon + Vercel Cron</footer>
    </div>
  )
}
