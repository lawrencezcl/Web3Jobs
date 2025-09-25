#!/usr/bin/env node

const WEBHOOK_URL = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret';

console.log('🚀 Edge Runtime Performance Test');
console.log('=================================');

async function testCommand(command, description) {
  const startTime = Date.now();

  const testMessage = {
    update_id: Date.now(),
    message: {
      message_id: Math.floor(Date.now() / 1000),
      from: {
        id: 999999999,
        is_bot: false,
        first_name: 'PerformanceTest',
        username: 'performancetest'
      },
      chat: {
        id: 999999999,
        first_name: 'PerformanceTest',
        username: 'performancetest',
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: command
    }
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Edge-Performance-Test/1.0'
      },
      body: JSON.stringify(testMessage)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const result = await response.json();

    console.log(`✅ ${description}: ${responseTime}ms`);
    console.log(`   Status: ${result.ok ? 'SUCCESS' : 'FAILED'}`);

    if (result.ok) {
      return { success: true, responseTime };
    } else {
      return { success: false, responseTime, error: result };
    }
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`❌ ${description}: ${responseTime}ms - ERROR: ${error.message}`);
    return { success: false, responseTime, error: error.message };
  }
}

async function runPerformanceTests() {
  const tests = [
    { command: '/start', description: 'Start Command' },
    { command: '/help', description: 'Help Command' },
    { command: '/latest', description: 'Latest Jobs Command' },
    { command: '/remote', description: 'Remote Jobs Command' },
    { command: '/search blockchain', description: 'Search Command' },
    { command: '/tags react', description: 'Tags Command' },
    { command: '/stats', description: 'Stats Command' }
  ];

  console.log('🧪 Running performance tests...\n');

  const results = [];
  for (const test of tests) {
    const result = await testCommand(test.command, test.description);
    results.push({ ...test, ...result });

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Performance Summary:');
  console.log('========================');

  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);

  if (successfulTests.length > 0) {
    const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
    const minResponseTime = Math.min(...successfulTests.map(r => r.responseTime));
    const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTime));

    console.log(`✅ Successful Tests: ${successfulTests.length}/${results.length}`);
    console.log(`📈 Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`⚡ Fastest Response: ${minResponseTime}ms`);
    console.log(`🐌 Slowest Response: ${maxResponseTime}ms`);

    if (avgResponseTime < 1000) {
      console.log('🚀 EXCELLENT: Average response time under 1 second');
    } else if (avgResponseTime < 2000) {
      console.log('👍 GOOD: Average response time under 2 seconds');
    } else {
      console.log('⚠️ SLOW: Average response time above 2 seconds');
    }
  }

  if (failedTests.length > 0) {
    console.log(`\n❌ Failed Tests: ${failedTests.length}`);
    failedTests.forEach(test => {
      console.log(`   ${test.description}: ${test.error || 'Unknown error'}`);
    });
  }

  console.log('\n🎯 Edge Runtime Benefits:');
  console.log('========================');
  console.log('• Lower latency through global edge distribution');
  console.log('• Faster cold start times');
  console.log('• Better handling of concurrent requests');
  console.log('• Improved reliability and scalability');

  return results;
}

runPerformanceTests().catch(console.error);