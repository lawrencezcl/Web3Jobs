import { prisma } from '../../../../lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function generateDetailedDescription(title: string, company: string, source: string): string {
  // Enhanced descriptions based on source and role type
  const roleTemplates = {
    'Protocol Engineer': {
      summary: 'Design and implement core protocol features for decentralized finance applications.',
      commonResponsibilities: [
        'Architect and develop smart contract protocols with security-first approach',
        'Optimize gas efficiency and transaction throughput for DeFi protocols',
        'Collaborate with security auditors to ensure protocol robustness',
        'Design tokenomics and governance mechanisms',
        'Work closely with product and design teams to implement user-facing features',
        'Research and implement cutting-edge DeFi primitives and mechanisms'
      ]
    },
    'DeFi Research Analyst': {
      summary: 'Conduct in-depth research and analysis of DeFi protocols, markets, and emerging trends.',
      commonResponsibilities: [
        'Analyze DeFi protocols, tokenomics, and market dynamics',
        'Research emerging DeFi trends and investment opportunities',
        'Create detailed reports on protocol risks and rewards',
        'Monitor on-chain data and identify market inefficiencies',
        'Collaborate with product teams to design new DeFi products',
        'Present findings to stakeholders and the broader DeFi community'
      ]
    },
    'Smart Contract Developer': {
      summary: 'Build secure and efficient smart contracts for next-generation DeFi applications.',
      commonResponsibilities: [
        'Develop and deploy smart contracts using Solidity and other languages',
        'Implement comprehensive testing suites and security measures',
        'Optimize contract gas usage and performance',
        'Integrate with frontend applications and external APIs',
        'Participate in code reviews and security audits',
        'Stay updated with latest smart contract best practices'
      ]
    },
    'Blockchain Developer': {
      summary: 'Develop blockchain solutions and applications for Web3 ecosystem.',
      commonResponsibilities: [
        'Build decentralized applications (dApps) using modern frameworks',
        'Implement blockchain integrations and wallet connectivity',
        'Develop smart contracts and ensure security best practices',
        'Work with various blockchain networks and Layer 2 solutions',
        'Collaborate with cross-functional teams on product features',
        'Stay current with blockchain technology trends and innovations'
      ]
    }
  }

  // Source-specific content
  const sourceInfo = {
    'wellfound': 'startup ecosystem',
    'crypto.com': 'cryptocurrency exchange platform',
    'bankless': 'DeFi and Web3 media organization',
    'twitter': 'decentralized social platform',
    'hackernews': 'technology community',
    'greenhouse': 'talent acquisition platform',
    'defipulse': 'DeFi protocol ecosystem',
    'github': 'developer platform',
    'stackoverflow': 'developer community'
  }

  // Get role template or create generic one
  const roleKey = Object.keys(roleTemplates).find(key => 
    title.toLowerCase().includes(key.toLowerCase())
  )
  const roleTemplate = roleKey ? roleTemplates[roleKey as keyof typeof roleTemplates] : null

  // Build comprehensive description
  const parts = []
  
  parts.push(`## About ${company}`)
  parts.push('')
  
  if (sourceInfo[source as keyof typeof sourceInfo]) {
    parts.push(`${company} is a leading company in the ${sourceInfo[source as keyof typeof sourceInfo]}, committed to building the future of open finance and Web3 technologies.`)
  } else {
    parts.push(`${company} is a leading protocol in the decentralized finance ecosystem, committed to building the future of open finance.`)
  }
  parts.push('')

  parts.push(`## Position: ${title}`)
  parts.push('')
  
  if (roleTemplate) {
    parts.push(roleTemplate.summary)
    parts.push('')
    parts.push('### Key Responsibilities:')
    roleTemplate.commonResponsibilities.forEach(item => {
      parts.push(`• ${item}`)
    })
    parts.push('')
  } else {
    parts.push(`We are seeking a talented ${title.toLowerCase()} to join our team and help build the future of decentralized finance.`)
    parts.push('')
    parts.push('### What You\'ll Do:')
    parts.push('• Design and implement innovative blockchain solutions')
    parts.push('• Collaborate with world-class engineers and researchers')
    parts.push('• Contribute to cutting-edge Web3 technologies')
    parts.push('• Work on protocols used by millions of users')
    parts.push('• Research and develop new blockchain primitives')
    parts.push('• Participate in the global Web3 community')
    parts.push('')
  }

  // Add requirements based on role type
  if (title.toLowerCase().includes('engineer') || title.toLowerCase().includes('developer')) {
    parts.push('### Technical Requirements:')
    parts.push('• 3+ years of blockchain/Web3 development experience')
    parts.push('• Proficiency in Solidity, Rust, or Go')
    parts.push('• Experience with Ethereum, Layer 2 solutions, or other blockchains')
    parts.push('• Knowledge of DeFi protocols and smart contract security')
    parts.push('• Familiarity with Web3 development tools and frameworks')
    parts.push('• Strong problem-solving and analytical skills')
    parts.push('')
  } else if (title.toLowerCase().includes('analyst') || title.toLowerCase().includes('research')) {
    parts.push('### Requirements:')
    parts.push('• 2+ years of experience in DeFi, crypto, or traditional finance')
    parts.push('• Strong analytical and research skills')
    parts.push('• Proficiency with on-chain analysis tools')
    parts.push('• Experience with data analysis and visualization')
    parts.push('• Understanding of financial markets and derivatives')
    parts.push('• Excellent written and verbal communication skills')
    parts.push('')
  } else {
    parts.push('### What We\'re Looking For:')
    parts.push('• Strong background in blockchain and Web3 technologies')
    parts.push('• Passion for decentralized finance and innovation')
    parts.push('• Experience in relevant domain or willingness to learn')
    parts.push('• Excellent communication and collaboration skills')
    parts.push('• Self-motivated and able to work independently')
    parts.push('• Commitment to building the future of finance')
    parts.push('')
  }

  parts.push('### What We Offer:')
  parts.push('• Competitive salary and token incentives')
  parts.push('• Remote-first culture with flexible working hours')
  parts.push('• Opportunity to shape the future of finance')
  parts.push('• Access to cutting-edge technology and resources')
  parts.push('• Professional development and learning opportunities')
  parts.push('• Health and wellness benefits')
  parts.push('• Annual team retreats and conferences')
  parts.push('')

  parts.push('### How to Apply:')
  parts.push('Join us in revolutionizing finance! Send your resume and a brief note about why you\'re excited about Web3 to our team.')
  parts.push('')
  parts.push(`*${company} is an equal opportunity employer committed to diversity and inclusion.*`)

  return parts.join('\\n')
}

export async function GET() {
  try {
    console.log('🔍 正在查找需要更新的工作描述...')
    
    // 查找所有简短描述的工作（所有数据源）
    const jobsToUpdate = await prisma.job.findMany({
      where: {
        OR: [
          {
            description: {
              contains: 'is seeking a'
            }
          },
          {
            description: {
              contains: 'is looking for a'
            }
          },
          {
            AND: [
              {
                description: {
                  not: null
                }
              },
              {
                description: {
                  // 描述太短（少于300字符）且不包含 markdown 标志
                  not: {
                    contains: '##'
                  }
                }
              }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`📊 找到 ${jobsToUpdate.length} 个需要更新的工作记录`)
    
    if (jobsToUpdate.length === 0) {
      return Response.json({ 
        success: true,
        message: '没有找到需要更新的工作记录',
        updated: 0
      })
    }
    
    let updated = 0
    let skipped = 0
    
    for (const job of jobsToUpdate) {
      try {
        // 检查是否是简短描述（少于500字符或不包含 markdown 格式）
        if (job.description && 
            (job.description.length > 500 || 
             job.description.includes('## About') ||
             job.description.includes('### Key Responsibilities'))) {
          skipped++
          continue
        }
        
        // 生成新的详细描述
        const newDescription = generateDetailedDescription(job.title, job.company, job.source)
        
        // 更新数据库
        await prisma.job.update({
          where: { id: job.id },
          data: { description: newDescription }
        })
        
        updated++
        console.log(`✅ 已更新: ${job.title} at ${job.company}`)
        
      } catch (error) {
        console.error(`❌ 更新失败 ${job.title} at ${job.company}:`, error)
        skipped++
      }
    }
    
    console.log(`📈 更新完成! 成功更新: ${updated} 个工作记录`)
    
    return Response.json({
      success: true,
      message: '工作描述更新完成',
      totalFound: jobsToUpdate.length,
      updated,
      skipped
    })
    
  } catch (error) {
    console.error('❌ 更新过程中发生错误:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}