'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Briefcase,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

interface AuthFormProps {
  mode?: 'login' | 'register'
  onSuccess?: () => void
}

export default function AuthForm({ mode = 'login', onSuccess }: AuthFormProps) {
  const { login, register } = useAuth()
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return false
    }

    if (currentMode === 'register') {
      if (!formData.name) {
        setError('Name is required')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      let result
      if (currentMode === 'login') {
        result = await login(formData.email, formData.password)
      } else {
        result = await register(formData.email, formData.password, formData.name)
      }

      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setCurrentMode(currentMode === 'login' ? 'register' : 'login')
    setError('')
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400">
            {currentMode === 'login'
              ? 'Sign in to access your job applications'
              : 'Get started with your Web3 career journey'
            }
          </p>
        </div>

        <Card className="p-8 bg-slate-900/50 backdrop-blur-sm border-slate-700">
          {/* Features */}
          {currentMode === 'register' && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Track job applications</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Save jobs for later</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Get personalized job alerts</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="pl-10 bg-slate-800 border-slate-600 focus:border-blue-400"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="pl-10 bg-slate-800 border-slate-600 focus:border-blue-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-slate-800 border-slate-600 focus:border-blue-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {currentMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 bg-slate-800 border-slate-600 focus:border-blue-400"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {currentMode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {currentMode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              {currentMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={switchMode}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                {currentMode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-slate-800 border-slate-700 text-slate-300">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <Badge className="bg-slate-800 border-slate-700 text-slate-300">
              <Zap className="w-3 h-3 mr-1" />
              Fast
            </Badge>
            <Badge className="bg-slate-800 border-slate-700 text-slate-300">
              <Briefcase className="w-3 h-3 mr-1" />
              Professional
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}