'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from './input'
import { Card } from './card'
import { Badge } from './badge'
import {
  Search,
  TrendingUp,
  Clock,
  MapPin,
  Briefcase,
  Building,
  X,
  ExternalLink,
} from 'lucide-react'

interface Suggestion {
  id: string
  type: 'job' | 'company' | 'tag' | 'location'
  title: string
  subtitle?: string
  url?: string
  count?: number
  trending?: boolean
}

interface SearchSuggestionsProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  // Job titles
  { id: '1', type: 'job', title: 'Solidity Developer', subtitle: '245 jobs', count: 245 },
  { id: '2', type: 'job', title: 'DeFi Engineer', subtitle: '189 jobs', count: 189 },
  { id: '3', type: 'job', title: 'Smart Contract Developer', subtitle: '167 jobs', count: 167 },
  { id: '4', type: 'job', title: 'Web3 Frontend Developer', subtitle: '134 jobs', count: 134 },
  { id: '5', type: 'job', title: 'Blockchain Engineer', subtitle: '298 jobs', count: 298 },

  // Companies
  { id: '6', type: 'company', title: 'Coinbase', subtitle: '45 open positions', count: 45 },
  { id: '7', type: 'company', title: 'Uniswap', subtitle: '23 open positions', count: 23 },
  { id: '8', type: 'company', title: 'Aave', subtitle: '18 open positions', count: 18 },
  { id: '9', type: 'company', title: 'Chainlink', subtitle: '31 open positions', count: 31 },
  { id: '10', type: 'company', title: 'OpenSea', subtitle: '19 open positions', count: 19 },

  // Tags
  { id: '11', type: 'tag', title: 'Rust', subtitle: '89 jobs', count: 89, trending: true },
  { id: '12', type: 'tag', title: 'TypeScript', subtitle: '234 jobs', count: 234 },
  { id: '13', type: 'tag', title: 'React', subtitle: '312 jobs', count: 312 },
  { id: '14', type: 'tag', title: 'Layer 2', subtitle: '67 jobs', count: 67, trending: true },
  { id: '15', type: 'tag', title: 'NFT', subtitle: '145 jobs', count: 145 },

  // Locations
  { id: '16', type: 'location', title: 'Remote', subtitle: '1,234 jobs', count: 1234 },
  { id: '17', type: 'location', title: 'New York', subtitle: '89 jobs', count: 89 },
  { id: '18', type: 'location', title: 'London', subtitle: '76 jobs', count: 76 },
  { id: '19', type: 'location', title: 'Singapore', subtitle: '54 jobs', count: 54 },
  { id: '20', type: 'location', title: 'Berlin', subtitle: '43 jobs', count: 43 },
]

const TRENDING_SEARCHES = [
  'Solidity Developer',
  'DeFi Protocol Engineer',
  'NFT Developer',
  'Layer 2 Solutions',
  'Smart Contract Auditor',
  'Web3 Product Manager',
  'Blockchain Researcher',
  'Rust Engineer',
]

const RECENT_SEARCHES = [
  'React Developer',
  'Smart Contract',
  'Remote Blockchain',
  'TypeScript Web3',
]

export default function SearchSuggestions({
  onSearch,
  placeholder = 'Search jobs, companies, or keywords...',
  className = ''
}: SearchSuggestionsProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const filtered = MOCK_SUGGESTIONS.filter(suggestion =>
      suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.subtitle?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)

    setSuggestions(filtered)
  }, [query])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(true)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    const searchQuery = suggestion.title
    setQuery(searchQuery)
    setShowSuggestions(false)

    // Add to recent searches
    addToRecentSearches(searchQuery)

    // Trigger search
    onSearch(searchQuery)
  }

  // Add search to recent searches
  const addToRecentSearches = (search: string) => {
    setRecentSearches(prev => {
      const updated = [search, ...prev.filter(item => item !== search)]
      return updated.slice(0, 5) // Keep only 5 recent searches
    })
  }

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      addToRecentSearches(query.trim())
      onSearch(query.trim())
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Get icon for suggestion type
  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-blue-400" />
      case 'company':
        return <Building className="w-4 h-4 text-purple-400" />
      case 'tag':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'location':
        return <MapPin className="w-4 h-4 text-orange-400" />
      default:
        return <Search className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-10 py-3 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowSuggestions(false)}
          />

          {/* Suggestions Card */}
          <Card className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-900 border-slate-700 shadow-xl">
            {/* Trending Searches */}
            {!query && (
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-300">Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({
                        id: `trending-${index}`,
                        type: 'job',
                        title: search,
                      })}
                      className="px-3 py-1 text-xs bg-slate-800 text-slate-300 border border-slate-600 rounded-full hover:bg-slate-700 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">Recent Searches</span>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({
                        id: `recent-${index}`,
                        type: 'job',
                        title: search,
                      })}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3 text-slate-500" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filtered Suggestions */}
            {suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 hover:bg-slate-800 transition-colors flex items-center gap-3"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {suggestion.title}
                        </span>
                        {suggestion.trending && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Trending
                          </Badge>
                        )}
                      </div>
                      {suggestion.subtitle && (
                        <span className="text-xs text-slate-400">
                          {suggestion.subtitle}
                        </span>
                      )}
                    </div>
                    {suggestion.count && (
                      <span className="text-xs text-slate-500">
                        {suggestion.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && suggestions.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No suggestions found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try different keywords or browse categories
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Press Enter to search, ESC to close
              </span>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Close
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}