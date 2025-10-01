import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Web3 Jobs - Telegram Mini App',
  description: 'Find the best Web3, blockchain, and cryptocurrency jobs with real-time alerts',
  robots: 'noindex, nofollow',
  other: {
    'telegram-bot': 'Web3job88bot',
    'telegram:web-app': 'true'
  }
}

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="telegram-mini-app telegram-theme-transition">
      {children}
    </div>
  )
}