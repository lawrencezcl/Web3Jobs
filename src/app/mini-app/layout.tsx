import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Web3 Jobs - Telegram Mini App',
  description: 'Find the best Web3, blockchain, and cryptocurrency jobs',
  robots: 'noindex, nofollow',
  other: {
    'telegram-bot': 'Web3job88bot'
  }
}

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}