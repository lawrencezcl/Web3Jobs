import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Web3 Remote Jobs',
  description: 'Auto-collected Web3 remote jobs',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  )
}
