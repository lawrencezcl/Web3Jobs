#!/usr/bin/env node

/**
 * Web3 Remote Jobs Platform - Health Check Script
 * Used by Docker containers to verify application health
 */

const http = require('http')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Database connection successful' }
  } catch (error) {
    return { status: 'unhealthy', message: `Database error: ${error.message}` }
  }
}

async function checkApplication() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'healthy', message: 'Application responding' })
      } else {
        resolve({ status: 'unhealthy', message: `HTTP status: ${res.statusCode}` })
      }
    })

    req.on('error', (error) => {
      resolve({ status: 'unhealthy', message: `Request error: ${error.message}` })
    })

    req.on('timeout', () => {
      resolve({ status: 'unhealthy', message: 'Request timeout' })
      req.destroy()
    })

    req.end()
  })
}

async function performHealthCheck() {
  console.log('🏥 Performing health check...')
  
  const checks = {
    timestamp: new Date().toISOString(),
    database: await checkDatabase(),
    application: await checkApplication()
  }

  const overallStatus = Object.values(checks)
    .filter(check => check && typeof check === 'object' && 'status' in check)
    .every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy'

  const result = {
    status: overallStatus,
    checks
  }

  console.log('📊 Health Check Results:')
  console.log(JSON.stringify(result, null, 2))

  // Exit with appropriate code
  process.exit(overallStatus === 'healthy' ? 0 : 1)
}

// Cleanup function
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

// Run health check
performHealthCheck().catch((error) => {
  console.error('❌ Health check failed:', error)
  process.exit(1)
})