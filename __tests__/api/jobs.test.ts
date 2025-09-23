import { GET } from '@/app/api/jobs/route'
import { prisma } from '@/lib/db'

// Mock the prisma module
jest.mock('@/lib/db', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      count: jest.fn(),
    }
  }
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return jobs with default parameters', async () => {
    const mockJobs = [
      {
        id: '1',
        title: 'Solidity Developer',
        company: 'Web3 Company',
        location: 'Remote',
        remote: true,
        tags: 'solidity,blockchain',
        url: 'https://example.com/job/1',
        source: 'lever',
        postedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01')
      }
    ]

    mockPrisma.job.findMany.mockResolvedValue(mockJobs as any)
    mockPrisma.job.count.mockResolvedValue(1)

    const request = new Request('http://localhost:3000/api/jobs')
    const response = await GET(request)
    const data = await response.json()

    expect(data).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      items: mockJobs
    })
  })

  it('should filter jobs by search query', async () => {
    const mockJobs = [
      {
        id: '1',
        title: 'Solidity Developer',
        company: 'Blockchain Corp',
        location: 'Remote',
        remote: true,
        tags: 'solidity,smart-contracts',
        url: 'https://example.com/job/1',
        source: 'greenhouse',
        postedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01')
      }
    ]

    mockPrisma.job.findMany.mockResolvedValue(mockJobs as any)
    mockPrisma.job.count.mockResolvedValue(1)

    const request = new Request('http://localhost:3000/api/jobs?q=solidity&remote=true&tag=blockchain')
    const response = await GET(request)
    const data = await response.json()

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      where: {
        remote: true,
        tags: { contains: 'blockchain', mode: 'insensitive' },
        OR: [
          { title: { contains: 'solidity', mode: 'insensitive' } },
          { company: { contains: 'solidity', mode: 'insensitive' } },
          { description: { contains: 'solidity', mode: 'insensitive' } },
          { tags: { contains: 'solidity', mode: 'insensitive' } },
        ]
      },
      orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
      take: 20,
      skip: 0
    })

    expect(data.items).toEqual(mockJobs)
  })

  it('should handle pagination correctly', async () => {
    mockPrisma.job.findMany.mockResolvedValue([])
    mockPrisma.job.count.mockResolvedValue(100)

    const request = new Request('http://localhost:3000/api/jobs?page=3&limit=10')
    const response = await GET(request)
    const data = await response.json()

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      where: { remote: true },
      orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
      take: 10,
      skip: 20 // (page 3 - 1) * limit 10
    })

    expect(data).toEqual({
      total: 100,
      page: 3,
      limit: 10,
      items: []
    })
  })
})