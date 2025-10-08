#!/usr/bin/env node

/**
 * 检查 Vercel Analytics 是否正确配置和工作
 */

import https from 'https';

// 检查网站是否可以访问
function checkWebsiteAccess(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 检查 Analytics 脚本是否正确加载
function checkAnalyticsScript(htmlContent) {
  // 检查是否包含 Vercel Analytics 相关的脚本
  const hasAnalyticsScript = htmlContent.includes('/_vercel/insights') || 
                           htmlContent.includes('vercel.com/insights') ||
                           htmlContent.includes('@vercel/analytics');
                           
  return hasAnalyticsScript;
}

// 主检查函数
async function checkAnalytics() {
  const websiteUrl = 'https://www.remotejobs.top/';
  
  console.log('🔍 检查 Vercel Analytics 配置...\n');
  
  try {
    console.log(`📡 检查网站访问: ${websiteUrl}`);
    const htmlContent = await checkWebsiteAccess(websiteUrl);
    console.log('✅ 网站可正常访问');
    
    console.log('\n📊 检查 Analytics 脚本...');
    const hasAnalytics = checkAnalyticsScript(htmlContent);
    
    if (hasAnalytics) {
      console.log('✅ Analytics 脚本已正确加载');
    } else {
      console.log('❌ 未检测到 Analytics 脚本');
      console.log('⚠️  可能的原因:');
      console.log('   1. 需要在 Vercel 控制台中启用 Web Analytics');
      console.log('   2. 应用未正确部署到 Vercel');
      console.log('   3. Analytics 组件配置有误');
    }
    
    console.log('\n📋 下一步操作建议:');
    console.log('1. 登录 Vercel 控制台: https://vercel.com/dashboard');
    console.log('2. 选择你的项目');
    console.log('3. 点击 "Analytics" 标签');
    console.log('4. 如果未启用，点击 "Enable" 按钮');
    console.log('5. 重新部署应用');
    console.log('6. 访问网站几个页面来生成数据');
    console.log('7. 等待几分钟后检查 Analytics 面板');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.log('\n🔧 故障排除建议:');
    console.log('1. 确认网站 URL 是否正确');
    console.log('2. 检查网站是否正常运行');
    console.log('3. 确认防火墙或网络限制');
  }
}

// 运行检查
checkAnalytics();