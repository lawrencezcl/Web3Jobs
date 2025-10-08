'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Crown,
  TrendingUp,
  Rocket,
  Check,
  X,
  CreditCard,
  Calendar,
  AlertCircle,
  Download,
  Upgrade,
  Downgrade,
  RefreshCw,
  DollarSign,
  FileText,
  Mail
} from 'lucide-react'

interface Subscription {
  id: string
  plan: string
  planName: string
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  maxJobs: number
  jobsUsed: number
  jobsRemaining: number
  features: string[]
}

interface PaymentHistory {
  id: string
  amount: number
  currency: string
  status: string
  type: string
  createdAt: string
  metadata?: any
}

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/user/payments', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data.payments || [])
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error)
    }
  }

  const handleCancelSubscription = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        await fetchSubscriptionData()
        setShowCancelModal(false)
        alert('Subscription will be canceled at the end of the billing period')
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      alert('Failed to cancel subscription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        await fetchSubscriptionData()
        alert('Subscription reactivated successfully')
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
      alert('Failed to reactivate subscription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpgradePlan = async (planId: string) => {
    setSelectedPlan(planId)
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId, billingCycle: 'month' }),
        credentials: 'include'
      })
      
      if (response.ok) {
        await fetchSubscriptionData()
        setShowUpgradeModal(false)
        alert('Plan upgraded successfully')
      }
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
      alert('Failed to upgrade plan')
    } finally {
      setActionLoading(false)
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'starter':
        return Rocket
      case 'professional':
        return TrendingUp
      case 'enterprise':
        return Crown
      default:
        return CreditCard
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'canceled':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'past_due':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          <p className="text-slate-400 mt-2">Manage your subscription plan and billing</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {subscription ? (
          <div className="space-y-8">
            {/* Current Plan Card */}
            <Card className="p-8 bg-slate-900/50 border-slate-700">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    {(() => {
                      const Icon = getPlanIcon(subscription.plan)
                      return <Icon className="w-6 h-6 text-blue-400" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{subscription.planName} Plan</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                      {subscription.cancelAtPeriodEnd && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                          Cancels on {formatDate(subscription.currentPeriodEnd)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {subscription.plan === 'starter' ? 'Free' : `$${subscription.plan === 'professional' ? '199' : '599'}/mo`}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Renews {formatDate(subscription.currentPeriodEnd)}
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Job Postings</span>
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {subscription.jobsUsed}
                    {subscription.maxJobs !== -1 && `/${subscription.maxJobs}`}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {subscription.maxJobs === -1 
                      ? 'Unlimited postings' 
                      : `${subscription.jobsRemaining} remaining this period`
                    }
                  </div>
                  {subscription.maxJobs !== -1 && (
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (subscription.jobsUsed / subscription.maxJobs) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Plan Features</span>
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="space-y-2">
                    {subscription.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </div>
                    ))}
                    {subscription.features.length > 3 && (
                      <div className="text-sm text-slate-400">
                        +{subscription.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Billing Cycle</span>
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Upgrade className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
                
                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading}
                    variant="outline"
                    className="border-green-600 hover:bg-green-600/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    variant="outline"
                    className="border-red-600 hover:bg-red-600/10"
                  >
                    Cancel Subscription
                  </Button>
                )}
                
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                
                <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
              </div>
            </Card>

            {/* Payment History */}
            <Card className="p-6 bg-slate-900/50 border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">Payment History</h3>
              
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No payment history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {payment.metadata?.planName || 'Subscription'}
                          </div>
                          <div className="text-sm text-slate-400">
                            {formatDate(payment.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          ${payment.amount} {payment.currency}
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* No Subscription State */
          <Card className="p-12 text-center bg-slate-900/50 border-slate-700">
            <Crown className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Active Subscription</h2>
            <p className="text-slate-400 mb-8">
              You're currently on the free plan. Upgrade to unlock more features.
            </p>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              View Pricing Plans
            </Button>
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-slate-900 border-slate-700 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-semibold text-white">Cancel Subscription?</h3>
            </div>
            
            <p className="text-slate-400 mb-6">
              Your subscription will remain active until {subscription?.currentPeriodEnd && formatDate(subscription.currentPeriodEnd)}.
              After that, you'll lose access to premium features.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border-slate-600 hover:bg-slate-800"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={actionLoading}
                variant="destructive"
                className="flex-1"
              >
                {actionLoading ? 'Canceling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 bg-slate-900 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Choose Your Plan</h3>
              <Button
                variant="ghost"
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  id: 'starter',
                  name: 'Starter',
                  price: 0,
                  features: ['3 job postings/month', 'Basic profile', 'Standard support']
                },
                {
                  id: 'professional',
                  name: 'Professional',
                  price: 199,
                  features: ['15 job postings/month', 'Verification badge', 'Advanced analytics'],
                  popular: true
                },
                {
                  id: 'enterprise',
                  name: 'Enterprise',
                  price: 599,
                  features: ['Unlimited postings', 'Premium support', 'Custom features']
                }
              ].map((plan) => (
                <Card key={plan.id} className={`p-6 bg-slate-800/50 border-slate-700 ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                }`}>
                  {plan.popular && (
                    <Badge className="mb-4 bg-blue-500 text-white">Most Popular</Badge>
                  )}
                  
                  <h4 className="text-lg font-semibold text-white mb-2">{plan.name}</h4>
                  <div className="text-2xl font-bold text-white mb-4">
                    ${plan.price}/mo
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgradePlan(plan.id)}
                    disabled={actionLoading || subscription?.plan === plan.id}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'border-slate-600 hover:bg-slate-700'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {subscription?.plan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}