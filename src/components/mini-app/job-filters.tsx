'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Filter, X, MapPin, Wifi } from 'lucide-react'

interface JobFiltersProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  remoteOnly: boolean
  onRemoteToggle: () => void
}

export function JobFilters({
  tags,
  selectedTags,
  onTagToggle,
  remoteOnly,
  onRemoteToggle
}: JobFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const clearAllFilters = () => {
    selectedTags.forEach(tag => onTagToggle(tag))
    if (remoteOnly) onRemoteToggle()
  }

  const hasActiveFilters = selectedTags.length > 0 || remoteOnly

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
              {selectedTags.length + (remoteOnly ? 1 : 0)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      {/* Remote Toggle */}
      <div className="mb-3">
        <Button
          variant={remoteOnly ? "default" : "outline"}
          size="sm"
          onClick={onRemoteToggle}
          className={`flex items-center space-x-2 ${
            remoteOnly
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Remote Only</span>
        </Button>
      </div>

      {/* Tags */}
      {isExpanded && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Skills & Technologies
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {remoteOnly && (
            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full flex items-center space-x-1">
              <Wifi className="w-3 h-3" />
              <span>Remote</span>
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={onRemoteToggle}
              />
            </span>
          )}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center space-x-1"
            >
              <span>#{tag}</span>
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onTagToggle(tag)}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}