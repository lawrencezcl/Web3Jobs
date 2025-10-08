'use client'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/auth-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <AuthForm mode="login" onSuccess={handleSuccess} />
    </div>
  )
}