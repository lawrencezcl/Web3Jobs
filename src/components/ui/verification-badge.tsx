'use client'

import { CheckCircle, Shield, Star, Clock, TrendingUp, AlertCircle, Info } from 'lucide-react'
import { Badge } from './badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface VerificationBadgeProps {
  type: 'verified' | 'trusted' | 'featured' | 'fast-response' | 'highly-rated' | 'pending' | 'none'
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
  companySlug?: string
}

const VERIFICATION_CONFIG = {
  verified: {
    icon: CheckCircle,
    label: 'Verified Company',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    tooltip: 'This company has been verified as a legitimate Web3 organization',
  },
  pending: {
    icon: Clock,
    label: 'Verification Pending',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    tooltip: 'This company has applied for verification and their request is under review',
  },
  none: {
    icon: Shield,
    label: 'Not Verified',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    tooltip: 'This company has not undergone verification. Exercise normal caution when applying.',
  },
  trusted: {
    icon: Shield,
    label: 'Trusted Partner',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    tooltip: 'Trusted partner with proven track record in Web3 space',
  },
  featured: {
    icon: Star,
    label: 'Featured',
    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    tooltip: 'Featured opportunity at a leading Web3 company',
  },
  'fast-response': {
    icon: Clock,
    label: 'Fast Response',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    tooltip: 'This company typically responds to applications within 3 days',
  },
  'highly-rated': {
    icon: TrendingUp,
    label: 'Highly Rated',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    tooltip: 'Excellent ratings from previous candidates',
  }
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-1 gap-1',
  md: 'text-sm px-3 py-1.5 gap-1.5',
  lg: 'text-base px-4 py-2 gap-2'
}

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
}

export default function VerificationBadge({
  type,
  size = 'md',
  showTooltip = true,
  className = '',
  companySlug
}: VerificationBadgeProps) {
  const config = VERIFICATION_CONFIG[type]
  const Icon = config.icon

  const handleClick = () => {
    if (type === 'none' && companySlug) {
      // Redirect to verification application
      window.open(`/companies/${companySlug}/verification`, '_blank')
    }
  }

  const badge = (
    <Badge
      variant="outline"
      className={`${config.color} ${SIZE_CLASSES[size]} flex items-center border ${type === 'none' ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={handleClick}
    >
      <Icon className={ICON_SIZES[size]} />
      <span>{config.label}</span>
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-800 border-slate-700 text-slate-200 max-w-xs">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Tooltip components (simple implementation)
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children, content, side }: {
  children: React.ReactNode
  content: React.ReactNode
  side?: string
}) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}>
        <div className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 max-w-xs whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  )
}

export function TooltipContent({ children, className }: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

export function TooltipTrigger({ children, asChild }: {
  children: React.ReactNode
  asChild?: boolean
}) {
  return <>{children}</>
}