'use client'

import { useState, useEffect } from 'react'

export interface Job {
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
  salary?: string | null
  seniorityLevel?: string | null
  description?: string | null
}

export interface SavedJob extends Job {
  savedAt: string
}

const SAVED_JOBS_KEY = 'web3jobs_saved_jobs'
const SAVED_JOBS_DATA_KEY = 'web3jobs_saved_jobs_data'

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [savedJobsData, setSavedJobsData] = useState<SavedJob[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem(SAVED_JOBS_KEY)
      const savedData = localStorage.getItem(SAVED_JOBS_DATA_KEY)

      if (savedIds) {
        const jobIds = JSON.parse(savedIds)
        setSavedJobs(new Set(jobIds))
      }

      if (savedData) {
        const jobsData = JSON.parse(savedData)
        setSavedJobsData(jobsData)
      }
    } catch (error) {
      console.error('Failed to load saved jobs:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever savedJobsData changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SAVED_JOBS_DATA_KEY, JSON.stringify(savedJobsData))
      } catch (error) {
        console.error('Failed to save jobs data:', error)
      }
    }
  }, [savedJobsData, isLoaded])

  // Save a job
  const saveJob = (job: Job) => {
    const newSavedJobs = new Set(savedJobs).add(job.id)
    setSavedJobs(newSavedJobs)

    const savedJob: SavedJob = {
      ...job,
      savedAt: new Date().toISOString()
    }

    setSavedJobsData(prev => {
      const existingIndex = prev.findIndex(j => j.id === job.id)
      if (existingIndex >= 0) {
        return prev
      }
      return [savedJob, ...prev]
    })

    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...newSavedJobs]))
    } catch (error) {
      console.error('Failed to save job:', error)
    }

    // Track save event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'save_job', {
        job_id: job.id,
        company: job.company,
        title: job.title
      })
    }
  }

  // Unsave a job
  const unsaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs)
    newSavedJobs.delete(jobId)
    setSavedJobs(newSavedJobs)

    setSavedJobsData(prev => prev.filter(job => job.id !== jobId))

    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...newSavedJobs]))
    } catch (error) {
      console.error('Failed to unsave job:', error)
    }

    // Track unsave event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'unsave_job', {
        job_id: jobId
      })
    }
  }

  // Toggle saved status
  const toggleSaveJob = (job: Job) => {
    if (savedJobs.has(job.id)) {
      unsaveJob(job.id)
      return false
    } else {
      saveJob(job)
      return true
    }
  }

  // Check if a job is saved
  const isJobSaved = (jobId: string) => {
    return savedJobs.has(jobId)
  }

  // Get count of saved jobs
  const savedJobsCount = savedJobs.size

  // Clear all saved jobs
  const clearSavedJobs = () => {
    setSavedJobs(new Set())
    setSavedJobsData([])

    try {
      localStorage.removeItem(SAVED_JOBS_KEY)
      localStorage.removeItem(SAVED_JOBS_DATA_KEY)
    } catch (error) {
      console.error('Failed to clear saved jobs:', error)
    }

    // Track clear all event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'clear_all_saved_jobs')
    }
  }

  // Get saved jobs by company
  const getSavedJobsByCompany = (company: string) => {
    return savedJobsData.filter(job =>
      job.company.toLowerCase().includes(company.toLowerCase())
    )
  }

  // Get saved jobs by tag
  const getSavedJobsByTag = (tag: string) => {
    return savedJobsData.filter(job =>
      job.tags?.toLowerCase().includes(tag.toLowerCase())
    )
  }

  // Get recently saved jobs
  const getRecentlySavedJobs = (days: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return savedJobsData.filter(job =>
      new Date(job.savedAt) >= cutoffDate
    )
  }

  // Export saved jobs
  const exportSavedJobs = () => {
    const dataStr = JSON.stringify(savedJobsData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `web3-jobs-saved-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Track export event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'export_saved_jobs', {
        job_count: savedJobsData.length
      })
    }
  }

  // Import saved jobs
  const importSavedJobs = (file: File) => {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedJobs = JSON.parse(e.target?.result as string)

          // Validate imported jobs
          if (!Array.isArray(importedJobs)) {
            throw new Error('Invalid file format')
          }

          // Merge with existing saved jobs, avoiding duplicates
          const mergedJobs = [...savedJobsData]
          const newJobIds = new Set(savedJobs)

          importedJobs.forEach((importedJob: SavedJob) => {
            if (!mergedJobs.some(job => job.id === importedJob.id)) {
              mergedJobs.push(importedJob)
              newJobIds.add(importedJob.id)
            }
          })

          setSavedJobsData(mergedJobs)
          setSavedJobs(newJobIds)

          // Update localStorage
          try {
            localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...newJobIds]))
            localStorage.setItem(SAVED_JOBS_DATA_KEY, JSON.stringify(mergedJobs))
          } catch (error) {
            console.error('Failed to save imported jobs:', error)
          }

          resolve(true)

          // Track import event
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'import_saved_jobs', {
              imported_count: importedJobs.length,
              total_count: mergedJobs.length
            })
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Check if jobs are still active
  const checkJobStatus = async () => {
    if (savedJobsData.length === 0) return

    const results = await Promise.allSettled(
      savedJobsData.map(async (job) => {
        try {
          const response = await fetch(job.url, { method: 'HEAD' })
          return {
            id: job.id,
            active: response.ok,
            status: response.status
          }
        } catch {
          return {
            id: job.id,
            active: false,
            status: 0
          }
        }
      })
    )

    const inactiveJobs = results
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && !result.value.active
      )
      .map(result => result.value.id)

    return {
      totalJobs: savedJobsData.length,
      inactiveJobs,
      activeJobs: savedJobsData.length - inactiveJobs.length
    }
  }

  return {
    savedJobs,
    savedJobsData,
    isLoaded,
    saveJob,
    unsaveJob,
    toggleSaveJob,
    isJobSaved,
    savedJobsCount,
    clearSavedJobs,
    getSavedJobsByCompany,
    getSavedJobsByTag,
    getRecentlySavedJobs,
    exportSavedJobs,
    importSavedJobs,
    checkJobStatus
  }
}