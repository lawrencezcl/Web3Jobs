'use client'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6" aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="flex items-center hover:text-blue-400 transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-slate-500" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-200">{item.label}</span>
          )}
        </div>
      ))}
      
      {/* Structured Data for Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Web3 Jobs",
                "item": "https://www.remotejobs.top"
              },
              ...items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 2,
                "name": item.label,
                "item": item.href ? `https://www.remotejobs.top${item.href}` : undefined
              }))
            ]
          })
        }}
      />
    </nav>
  )
}