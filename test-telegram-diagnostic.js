#!/usr/bin/env node

const TELEGRAM_BOT_TOKEN = '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q';
const WEBHOOK_URL = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret';

console.log('🤖 Telegram Bot Diagnostic Test');
console.log('=================================');

async function testWebhook() {
  try {
    console.log('1. Testing webhook endpoint...');

    const testMessage = {
      update_id: Date.now(),
      message: {
        message_id: Math.floor(Date.now() / 1000),
        from: {
          id: 999999999,
          is_bot: false,
          first_name: 'Diagnostic',
          username: 'diagnostic'
        },
        chat: {
          id: 999999999,
          first_name: 'Diagnostic',
          username: 'diagnostic',
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: '/start'
      }
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    const result = await response.json();
    console.log('✅ Webhook test result:', result);

    if (result.ok) {
      console.log('✅ Webhook is working correctly');
      console.log('✅ Bot should respond to Telegram messages');
    } else {
      console.log('❌ Webhook test failed');
    }

  } catch (error) {
    console.error('❌ Webhook test error:', error.message);
  }
}

async function testBotInfo() {
  try {
    console.log('\n2. Testing bot information...');

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const result = await response.json();

    if (result.ok) {
      console.log('✅ Bot is active and accessible');
      console.log(`📝 Bot Name: ${result.result.first_name}`);
      console.log(`👤 Username: @${result.result.username}`);
      console.log(`🆔 Bot ID: ${result.result.id}`);
    } else {
      console.log('❌ Bot access failed:', result.description);
    }
  } catch (error) {
    console.error('❌ Bot info test error:', error.message);
  }
}

async function testWebhookInfo() {
  try {
    console.log('\n3. Testing webhook configuration...');

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook is configured');
      console.log(`📡 Webhook URL: ${result.result.url}`);
      console.log(`📊 Pending updates: ${result.result.pending_update_count}`);
      console.log(`🔧 Max connections: ${result.result.max_connections}`);

      if (result.result.url.includes('web3jobs-telegram-webhook-secret')) {
        console.log('✅ Webhook secret is configured');
      } else {
        console.log('❌ Webhook secret is missing');
      }
    } else {
      console.log('❌ Webhook info failed:', result.description);
    }
  } catch (error) {
    console.error('❌ Webhook info test error:', error.message);
  }
}

async function runAllTests() {
  await testBotInfo();
  await testWebhookInfo();
  await testWebhook();

  console.log('\n🎯 Troubleshooting Tips:');
  console.log('========================');
  console.log('1. Make sure you\'re messaging @Web3job88bot');
  console.log('2. Try sending /start first');
  console.log('3. Check if you have an active internet connection');
  console.log('4. Wait a few minutes and try again');
  console.log('5. If still not working, the bot might be temporarily down');
}

runAllTests();