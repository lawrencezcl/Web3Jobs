import Link from 'next/link'
import { ArrowLeft, Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Page Not Found | Web3 Jobs Platform',
  description: 'The page you are looking for does not exist. Explore our Web3 job opportunities instead.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center max-w-2xl">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            404
          </div>
          <div className="text-6xl mb-4">🚀</div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Oops! Page Not Found
        </h1>

        <p className="text-xl text-slate-400 mb-8 leading-relaxed">
          The Web3 opportunity you're looking for may have moved, expired, or never existed.
          But don't worry - there are plenty of amazing blockchain careers waiting for you!
        </p>

        {/* Search Suggestions */}
        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Popular Searches</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'Solidity Developer',
              'DeFi Engineer',
              'Smart Contract',
              'NFT Developer',
              'Blockchain Analyst',
              'Web3 Frontend'
            ].map((search) => (
              <Link
                key={search}
                href={`/jobs?q=${encodeURIComponent(search.toLowerCase())}`}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 rounded-lg transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <Link href="/jobs">
            <Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800">
              <Search className="w-4 h-4 mr-2" />
              Browse All Jobs
            </Button>
          </Link>
        </div>

        {/* Additional Navigation */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-slate-400 mb-4">Looking for something specific?</p>
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/jobs?remote=true" className="text-blue-400 hover:text-blue-300 transition-colors">
              Remote Jobs
            </Link>
            <Link href="/jobs?q=defi" className="text-blue-400 hover:text-blue-300 transition-colors">
              DeFi Positions
            </Link>
            <Link href="/jobs?q=nft" className="text-blue-400 hover:text-blue-300 transition-colors">
              NFT Opportunities
            </Link>
            <Link href="/jobs?q=solidity" className="text-blue-400 hover:text-blue-300 transition-colors">
              Solidity Development
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}