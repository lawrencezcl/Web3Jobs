'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/auth-form'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <AuthForm
      mode={mode}
      onSuccess={() => router.push('/dashboard')}
    />
  )
}