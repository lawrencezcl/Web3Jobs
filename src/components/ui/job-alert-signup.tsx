'use client'

import { useState, useCallback } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Card } from './card'
import { Badge } from './badge'
import { Bell, CheckCircle, Mail, AlertCircle, X } from 'lucide-react'

interface JobAlertSignupProps {
  className?: string
}

const AVAILABLE_TOPICS = [
  'Smart Contracts',
  'DeFi',
  'NFT',
  'Layer 2',
  'Blockchain Development',
  'Web3 Frontend',
  'Solidity',
  'Rust',
  'DAO',
  'GameFi',
  'Staking',
  'Liquidity',
  'Trading',
  'Exchange',
  'Wallet',
  'Token'
]

const FREQUENCIES = [
  { value: 'daily', label: 'Daily', description: 'Get job alerts every day' },
  { value: 'weekly', label: 'Weekly', description: 'Get a weekly digest' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Get alerts twice a week' }
]

export default function JobAlertSignup({ className }: JobAlertSignupProps) {
  const [email, setEmail] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [frequency, setFrequency] = useState('daily')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const toggleTopic = useCallback((topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setResult({ type: 'error', message: 'Please enter your email address' })
      return
    }

    if (selectedTopics.length === 0) {
      setResult({ type: 'error', message: 'Please select at least one topic' })
      return
    }

    setIsLoading(true)
    setResult({ type: null, message: '' })

    try {
      const response = await fetch('/api/job-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          topics: selectedTopics,
          frequency
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: 'success',
          message: '🎉 Perfect! Check your email to confirm your subscription.'
        })
        setEmail('')
        setSelectedTopics([])
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to subscribe. Please try again.'
        })
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }, [email, selectedTopics, frequency])

  return (
    <div className={`bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20 ${className || ''}`}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Never Miss a Web3 Opportunity</h2>
          <p className="text-slate-400 text-lg">
            Get personalized job alerts delivered to your inbox. Be the first to know about
            the perfect opportunities in Web3, blockchain, and cryptocurrency.
          </p>
        </div>

        {result.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
            result.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {result.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{result.message}</p>
            <button
              onClick={() => setResult({ type: null, message: '' })}
              className="ml-auto flex-shrink-0 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 text-base"
                required
              />
            </div>
          </div>

          {/* Topics Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Your Interests
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVAILABLE_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedTopics.includes(topic)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/10 border border-slate-300 text-slate-700 hover:bg-white/20'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            {selectedTopics.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-sm text-slate-600">Selected:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedTopics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                      <button
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              How Often?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FREQUENCIES.map((freq) => (
                <label
                  key={freq.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    frequency === freq.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={freq.value}
                    checked={frequency === freq.value}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className={`font-medium ${frequency === freq.value ? 'text-blue-600' : 'text-slate-900'}`}>
                      {freq.label}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{freq.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !email || selectedTopics.length === 0}
            className="w-full h-12 text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Subscribing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Subscribe to Job Alerts</span>
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Join 10,000+ Web3 professionals finding their dream jobs</p>
          <p className="mt-1">Unsubscribe anytime • No spam, ever</p>
        </div>
      </div>
    </div>
  )
}