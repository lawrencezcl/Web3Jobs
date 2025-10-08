'use client'
import { useState, useEffect } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Badge } from './badge'
import {
  Mail,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Clock,
  Globe,
  Tag
} from 'lucide-react'

interface NewsletterSignupProps {
  className?: string
  variant?: 'default' | 'compact' | 'sidebar'
}

const TRENDING_KEYWORDS = [
  'Solidity', 'DeFi', 'Smart Contracts', 'Rust', 'TypeScript', 'React'
]

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Get jobs every day' },
  { value: 'weekly', label: 'Weekly', description: 'Best for busy professionals' },
  { value: 'instant', label: 'Instant', description: 'Alerts as soon as jobs are posted' }
]

export default function NewsletterSignup({ className = '', variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('web3jobs-email')
    const savedKeywords = localStorage.getItem('web3jobs-keywords')
    const savedFrequency = localStorage.getItem('web3jobs-frequency')
    const savedRemote = localStorage.getItem('web3jobs-remote')

    if (savedEmail) setEmail(savedEmail)
    if (savedKeywords) setSelectedKeywords(JSON.parse(savedKeywords))
    if (savedFrequency) setFrequency(savedFrequency)
    if (savedRemote) setRemoteOnly(JSON.parse(savedRemote))
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    if (email) localStorage.setItem('web3jobs-email', email)
    localStorage.setItem('web3jobs-keywords', JSON.stringify(selectedKeywords))
    localStorage.setItem('web3jobs-frequency', frequency)
    localStorage.setItem('web3jobs-remote', JSON.stringify(remoteOnly))
  }, [email, selectedKeywords, frequency, remoteOnly])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          frequency,
          keywords: selectedKeywords,
          tags: selectedKeywords, // Treat keywords as tags for now
          remote: remoteOnly
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('🎉 Successfully subscribed! Check your email for confirmation.')

        // Track successful signup
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup', {
            email: email,
            frequency: frequency,
            keywords_count: selectedKeywords.length
          })
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  const handleUnsubscribe = async () => {
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Successfully unsubscribed from job alerts')
        setEmail('')
        setSelectedKeywords([])
      } else {
        setStatus('error')
        setMessage('Failed to unsubscribe. Please contact support.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-slate-900/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter your email for job alerts"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? '...' : 'Subscribe'}
          </Button>
        </div>
        {status === 'success' && (
          <div className="mt-2 text-sm text-green-400 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {message}
          </div>
        )}
        {status === 'error' && (
          <div className="mt-2 text-sm text-red-400 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {message}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={`bg-slate-900/50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center mb-4">
          <Mail className="w-6 h-6 text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold">Job Alerts</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
          />

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-100"
          >
            {FREQUENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? 'Subscribing...' : 'Get Job Alerts'}
          </Button>
        </form>

        {status === 'success' && (
          <div className="mt-3 text-sm text-green-400 flex items-start">
            <CheckCircle className="w-4 h-4 mr-1 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-3 text-sm text-red-400 flex items-start">
            <AlertCircle className="w-4 h-4 mr-1 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-400 mr-3" />
          <h2 className="text-3xl font-bold">Never Miss a Web3 Opportunity</h2>
        </div>

        <p className="text-slate-300 mb-8 text-lg">
          Get personalized job alerts delivered straight to your inbox
        </p>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Successfully Subscribed!</h3>
            <p className="text-slate-300 mb-4">{message}</p>
            <Button
              onClick={() => {
                setStatus('idle')
                setMessage('')
                setEmail('')
                setSelectedKeywords([])
              }}
              variant="outline"
              className="border-green-500/20 hover:bg-green-500/10"
            >
              Subscribe Another Email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/10 focus:bg-white/10 text-white placeholder-white/50 text-lg py-4 px-6"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 text-lg px-8 py-4"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center mx-auto"
              >
                <Search className="w-4 h-4 mr-1" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>

            {showAdvanced && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Alert Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {FREQUENCY_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFrequency(option.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          frequency === option.value
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Interests (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_KEYWORDS.map(keyword => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => handleKeywordToggle(keyword)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedKeywords.includes(keyword)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/20'
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-slate-300">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <Globe className="w-4 h-4 mr-1" />
                    Remote jobs only
                  </label>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {message}
              </div>
            )}

            <p className="text-xs text-slate-400">
              Join 10,000+ Web3 professionals. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}