'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JobSearchProps {
  onSearch: (query: string) => void
  searchQuery: string
}

export function JobSearch({ onSearch, searchQuery }: JobSearchProps) {
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, onSearch])

  const handleClear = () => {
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(inputValue)
  }

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        }`}>
          <Search className="absolute left-3 w-5 h-5 text-gray-400" />

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search jobs, companies, or skills..."
            className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          )}
        </div>

        {/* Voice search placeholder */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
          disabled
        >
          <Mic className="w-4 h-4 text-gray-400" />
        </Button>
      </form>

      {/* Quick search suggestions */}
      <div className="mt-2 flex flex-wrap gap-2">
        {['Solidity', 'React', 'DeFi', 'NFT', 'Smart Contracts'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputValue(suggestion)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}