#!/usr/bin/env node

const WEBHOOK_URL = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret';
const LOGS_URL = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/logs';

console.log('🔍 Webhook Monitor');
console.log('================');

async function sendTestMessage() {
  const testMessage = {
    update_id: Date.now(),
    message: {
      message_id: Math.floor(Date.now() / 1000),
      from: {
        id: 111222333,
        is_bot: false,
        first_name: 'Monitor',
        username: 'monitor'
      },
      chat: {
        id: 111222333,
        first_name: 'Monitor',
        username: 'monitor',
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: '/help'
    }
  };

  try {
    console.log('📡 Sending test message to webhook...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Monitor/1.0'
      },
      body: JSON.stringify(testMessage)
    });

    const result = await response.json();
    console.log('✅ Webhook response:', result);

  } catch (error) {
    console.error('❌ Error sending test message:', error.message);
  }
}

async function checkLogs() {
  try {
    console.log('📋 Checking logs...');
    const response = await fetch(LOGS_URL);
    const logs = await response.json();
    console.log('📊 Logs response:', JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('❌ Error checking logs:', error.message);
  }
}

async function monitor() {
  console.log('⏰ Starting monitor (will run for 2 minutes)...');

  // Send initial test
  await sendTestMessage();

  // Check logs
  await checkLogs();

  // Monitor every 30 seconds
  const interval = setInterval(async () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🔄 Check at ${new Date().toLocaleTimeString()}`);
    await checkLogs();
  }, 30000);

  // Stop after 2 minutes
  setTimeout(() => {
    clearInterval(interval);
    console.log('\n⏹️ Monitor stopped');
  }, 120000);
}

// Run monitor
monitor();