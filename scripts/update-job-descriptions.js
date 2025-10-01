#!/usr/bin/env node

/**
 * 更新现有工作描述 - 为历史数据补充详细信息
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateDetailedDescription(title, company) {
  const baseDescription = `## About ${company}

${company} is a leading protocol in the decentralized finance ecosystem, committed to building the future of open finance.

## Position: ${title}

We are seeking a talented ${title.toLowerCase()} to join our team and help build the future of decentralized finance.

### Key Responsibilities:
• Design and implement innovative DeFi solutions
• Collaborate with world-class engineers and researchers  
• Contribute to open-source protocols used by millions
• Research and develop new financial primitives
• Work with cutting-edge blockchain technologies
• Participate in protocol governance and decision-making

### What We're Looking For:
• Strong technical background in blockchain and smart contracts
• Passion for decentralized finance and Web3 technologies
• Experience with Solidity, JavaScript, or Python
• Understanding of financial markets and protocols
• Excellent communication and collaboration skills
• Self-motivated and able to work independently

### What We Offer:
• Competitive salary and token incentives
• Remote-first culture with flexible working hours
• Opportunity to shape the future of finance
• Access to cutting-edge technology and resources
• Professional development and learning opportunities
• Health and wellness benefits

### How to Apply:
Join us in revolutionizing finance! Send your resume and a brief note about why you're excited about DeFi to our team.

*${company} is an equal opportunity employer committed to diversity and inclusion.*`

  return baseDescription
}

async function updateJobDescriptions() {
  try {
    console.log('🔍 正在查找需要更新的工作描述...')
    
    const jobsToUpdate = await prisma.job.findMany({
      where: {
        source: 'defipulse',
        description: {
          contains: 'is seeking a'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 找到 ${jobsToUpdate.length} 个需要更新的工作记录`)
    
    if (jobsToUpdate.length === 0) {
      console.log('✅ 没有找到需要更新的工作记录')
      return
    }
    
    let updated = 0
    
    for (const job of jobsToUpdate) {
      try {
        if (job.description && job.description.length > 200) {
          continue
        }
        
        const newDescription = generateDetailedDescription(job.title, job.company)
        
        await prisma.job.update({
          where: { id: job.id },
          data: { description: newDescription }
        })
        
        updated++
        console.log(`✅ 已更新: ${job.title} at ${job.company}`)
        
        if (updated % 10 === 0) {
          console.log(`⏳ 已更新 ${updated} 个工作记录，暂停 1 秒...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`❌ 更新失败 ${job.title} at ${job.company}:`, error.message)
      }
    }
    
    console.log(`\\n📈 更新完成! 成功更新: ${updated} 个工作记录`)
    
  } catch (error) {
    console.error('❌ 更新过程中发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  console.log('🚀 开始更新工作描述...')
  await updateJobDescriptions()
  console.log('🎉 更新完成!')
}

main().catch(console.error)