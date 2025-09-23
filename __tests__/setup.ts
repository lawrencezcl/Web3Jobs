// Test setup file
import { jest } from '@jest/globals'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  notFound: jest.fn(),
}))

jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children
})

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      groupBy: jest.fn(),
    },
    subscriber: {
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    crawlLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    }
  }
}))

// Mock fetch
global.fetch = jest.fn()

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}