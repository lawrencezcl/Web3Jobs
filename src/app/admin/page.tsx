'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface Job {
  id?: string
  title: string
  company: string
  location: string
  remote: boolean
  salary: string
  employmentType: string
  postedAt?: string
  url: string
  applyUrl?: string
  tags: string[]
  description: string
}

export default function AdminPage() {
  const [job, setJob] = useState<Job>({
    title: '',
    company: '',
    location: 'Remote',
    remote: true,
    salary: '',
    employmentType: 'Full-time',
    url: '',
    applyUrl: '',
    tags: [],
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof Job, value: string | boolean | string[]) => {
    setJob(prev => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setJob(prev => ({ ...prev, tags }))
  }

  const validateJob = (): string | null => {
    if (!job.title.trim()) return 'Title is required'
    if (!job.company.trim()) return 'Company is required'
    if (!job.description.trim()) return 'Description is required'
    if (!job.url.trim()) return 'URL is required'
    return null
  }

  const postJob = async () => {
    const validationError = validateJob()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/post-job-to-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_JOB_POSTING_TOKEN || 'web3jobs-posting-secret'}`
        },
        body: JSON.stringify({
          ...job,
          id: `admin_${Date.now()}`,
          postedAt: new Date().toISOString()
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Reset form
        setJob({
          title: '',
          company: '',
          location: 'Remote',
          remote: true,
          salary: '',
          employmentType: 'Full-time',
          url: '',
          applyUrl: '',
          tags: [],
          description: ''
        })
      }
    } catch (error) {
      setError('Failed to post job. Please try again.')
      console.error('Error posting job:', error)
    } finally {
      setLoading(false)
    }
  }

  const testIngestion = async () => {
    const validationError = validateJob()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/ingest-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_INGESTION_TOKEN || 'web3jobs-ingestion-secret'
        },
        body: JSON.stringify(job)
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setError('Failed to test ingestion. Please try again.')
      console.error('Error testing ingestion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Web3 Jobs Admin</h1>
          <p className="text-gray-600 mb-6">Post jobs to @web3jobs88 Telegram channel</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={job.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Senior Blockchain Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={job.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="CryptoTech Inc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={job.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Remote"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={job.remote}
                      onChange={(e) => handleInputChange('remote', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Remote Position</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={job.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="$120k - $180k"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={job.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job URL *
                  </label>
                  <input
                    type="url"
                    value={job.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/job"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application URL
                  </label>
                  <input
                    type="url"
                    value={job.applyUrl}
                    onChange={(e) => handleInputChange('applyUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/apply"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={job.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="blockchain, solidity, web3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={job.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Job description with requirements and responsibilities..."
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={postJob}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Posting...' : 'Post to Channel'}
                  </Button>
                  <Button
                    onClick={testIngestion}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    {loading ? 'Testing...' : 'Test Ingestion'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Results</h2>

              {result ? (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className="font-semibold mb-2">{result.success ? '✅ Success' : '❌ Error'}</h3>
                  <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    Fill out the job details and click "Post to Channel" to send the job to @web3jobs88 Telegram channel.
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Use "Test Ingestion" to test the job ingestion pipeline with Web3 filtering.
                  </p>
                </div>
              )}

              {/* API Documentation */}
              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">API Endpoints</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>POST /api/post-job-to-channel</strong>
                    <p className="text-gray-600">Post job directly to channel</p>
                  </div>
                  <div>
                    <strong>POST /api/ingest-job</strong>
                    <p className="text-gray-600">Ingest job with Web3 filtering</p>
                  </div>
                </div>
              </div>

              {/* Example Usage */}
              <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Bot Commands</h3>
                <div className="text-sm space-y-1">
                  <p><code>/postjob {"{JSON data}"}</code></p>
                  <p><code>/ingest</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}