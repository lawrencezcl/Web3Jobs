'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  Rocket,
  TrendingUp,
  Shield,
  Users,
  BarChart,
  Globe,
  Target,
  ArrowRight,
  HelpCircle
} from 'lucide-react'

interface PricingPlan {
  name: string
  description: string
  price: number
  period: 'month' | 'year'
  features: string[]
  notIncluded?: string[]
  popular?: boolean
  icon: React.ComponentType<{ className?: string }>
  buttonText: string
  buttonVariant: 'default' | 'outline'
  maxJobs?: number
  highlighted?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for small companies and startups',
    price: 0,
    period: 'month',
    icon: Rocket,
    buttonText: 'Start Free',
    buttonVariant: 'outline',
    maxJobs: 3,
    features: [
      '3 job postings per month',
      'Basic company profile',
      '30-day job duration',
      'Standard job visibility',
      'Email support',
      'Basic analytics dashboard'
    ],
    notIncluded: [
      'Company verification badge',
      'Featured job placement',
      'Candidate search',
      'Advanced analytics',
      'Priority support'
    ]
  },
  {
    name: 'Professional',
    description: 'Ideal for growing companies and recruitment agencies',
    price: 199,
    period: 'month',
    icon: TrendingUp,
    buttonText: 'Start Pro Trial',
    buttonVariant: 'default',
    popular: true,
    maxJobs: 15,
    highlighted: true,
    features: [
      '15 job postings per month',
      'Enhanced company profile',
      '60-day job duration',
      'Priority job placement',
      'Company verification badge',
      '1 featured job per month',
      'Candidate database access',
      'Advanced analytics & insights',
      'Email & chat support',
      'Custom application forms',
      'Social media promotion'
    ],
    notIncluded: [
      'Dedicated account manager',
      'API access',
      'White-label options'
    ]
  },
  {
    name: 'Enterprise',
    description: 'Complete solution for large organizations',
    price: 599,
    period: 'month',
    icon: Crown,
    buttonText: 'Contact Sales',
    buttonVariant: 'default',
    maxJobs: -1, // Unlimited
    features: [
      'Unlimited job postings',
      'Premium company profile',
      '90-day job duration',
      'Top placement in search results',
      'Premium verification badge',
      '5 featured jobs per month',
      'Full candidate database access',
      'Predictive hiring analytics',
      'Dedicated account manager',
      'Priority phone support',
      'Custom branding options',
      'ATS integration',
      'Bulk job posting',
      'Multi-location management',
      'Company culture showcase',
      'Employee testimonials'
    ]
  },
  {
    name: 'Lifetime',
    description: 'One-time payment for permanent access',
    price: 2999,
    period: 'year',
    icon: Star,
    buttonText: 'Get Lifetime Access',
    buttonVariant: 'default',
    maxJobs: -1,
    features: [
      'All Professional features included',
      'Unlimited job postings forever',
      'Lifetime company verification',
      '3 featured jobs per month permanently',
      'All future updates included',
      'One-time payment, no recurring fees',
      'Priority feature requests',
      'Lifetime analytics access'
    ]
  }
]

const addOns = [
  {
    name: 'Featured Job Boost',
    price: 49,
    description: 'Make your job stand out with premium placement for 7 days',
    icon: Star
  },
  {
    name: 'Urgent Hiring Badge',
    price: 29,
    description: 'Highlight urgent positions to attract quality candidates faster',
    icon: Zap
  },
  {
    name: 'Social Media Package',
    price: 99,
    description: 'Promote your jobs across our social media channels (LinkedIn, Twitter)',
    icon: Globe
  },
  {
    name: 'Candidate Database Credits',
    price: 199,
    description: 'Access 500 qualified candidates from our database',
    icon: Users
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const getAdjustedPrice = (plan: PricingPlan) => {
    if (billingCycle === 'yearly' && plan.price > 0) {
      return {
        price: Math.round(plan.price * 10), // 2 months free
        savings: Math.round(plan.price * 2)
      }
    }
    return { price: plan.price, savings: 0 }
  }

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName)
    // Handle plan selection logic
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              Pricing Plans
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
              Flexible pricing options designed to help you find the best Web3 talent.
              Start free and scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
                Yearly
                {billingCycle === 'yearly' && (
                  <Badge className="ml-2 bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    Save 20%
                  </Badge>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon
            const adjustedPrice = getAdjustedPrice(plan)
            const isPopular = plan.popular
            const isHighlighted = plan.highlighted

            return (
              <Card
                key={plan.name}
                className={`relative p-8 bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 ${
                  isPopular ? 'ring-2 ring-blue-500/50' : ''
                } ${isHighlighted ? 'bg-gradient-to-b from-blue-500/5 to-slate-900/50' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1 text-sm font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${
                    isPopular ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-white">Free</div>
                    ) : (
                      <div>
                        <div className="text-4xl font-bold text-white">
                          ${adjustedPrice.price}
                          <span className="text-lg font-normal text-slate-400">
                            /{billingCycle === 'yearly' && plan.period === 'year' ? 'year' : 'month'}
                          </span>
                        </div>
                        {billingCycle === 'yearly' && adjustedPrice.savings > 0 && (
                          <div className="text-sm text-green-400 mt-1">
                            Save ${adjustedPrice.savings}/year
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    className={`w-full ${
                      plan.buttonVariant === 'default'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'border-slate-600 hover:bg-slate-800'
                    }`}
                    variant={plan.buttonVariant}
                    onClick={() => handlePlanSelect(plan.name)}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                    What's included
                  </div>
                  
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}

                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <>
                      <div className="text-sm font-medium text-slate-300 uppercase tracking-wide pt-4">
                        Not included
                      </div>
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <X className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-500">{feature}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Add-ons Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Enhance Your Hiring</h2>
            <p className="text-slate-400 text-lg">
              Add-on services to boost your recruitment efforts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addOn) => {
              const Icon = addOn.icon
              return (
                <Card key={addOn.name} className="p-6 bg-slate-900/50 border-slate-700 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{addOn.name}</h3>
                      <div className="text-2xl font-bold text-blue-400">${addOn.price}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{addOn.description}</p>
                  <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-800">
                    Add to Plan
                  </Button>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-lg">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, debit cards, and cryptocurrency payments (ETH, USDC, USDT).'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 14-day money-back guarantee for all paid plans. No questions asked.'
              },
              {
                question: 'Is my data secure?',
                answer: 'Yes, we use industry-standard encryption and security practices to protect your data.'
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Absolutely! You can cancel your subscription at any time with no cancellation fees.'
              },
              {
                question: 'Do you offer custom plans?',
                answer: 'Yes, we can create custom plans for enterprise clients. Contact our sales team to discuss your needs.'
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6 bg-slate-900/50 border-slate-700">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                    <p className="text-sm text-slate-400">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="p-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Find Top Web3 Talent?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Join thousands of companies hiring the best blockchain professionals
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/employer/post">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                  Start Posting Jobs
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-800">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}