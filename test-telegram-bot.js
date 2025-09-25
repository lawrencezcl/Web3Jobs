#!/usr/bin/env node

const TELEGRAM_BOT_TOKEN = '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q';

async function sendTestMessage() {
  try {
    console.log('🧪 Testing Telegram bot functionality...');

    // Test message to simulate a user sending /start
    const testMessage = {
      update_id: 123456789,
      message: {
        message_id: 1,
        from: {
          id: 123456789, // Test user ID
          first_name: 'Test',
          username: 'testuser'
        },
        chat: {
          id: 123456789,
          first_name: 'Test',
          username: 'testuser',
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: '/start'
      }
    };

    // Send to our webhook
    const webhookUrl = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret';

    console.log('📡 Sending test message to webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    const result = await response.json();
    console.log('📥 Webhook response:', result);

    if (result.ok) {
      console.log('✅ Test message processed successfully!');
    } else {
      console.error('❌ Test message failed:', result);
    }

  } catch (error) {
    console.error('❌ Error testing bot:', error);
  }
}

async function testBotCommands() {
  const commands = [
    '/start',
    '/help',
    '/latest',
    '/remote',
    '/search solidity',
    '/tags react',
    '/stats'
  ];

  for (const command of commands) {
    console.log(`\n🧪 Testing command: ${command}`);

    const testMessage = {
      update_id: Date.now(),
      message: {
        message_id: Math.floor(Math.random() * 1000),
        from: {
          id: 123456789,
          first_name: 'Test',
          username: 'testuser'
        },
        chat: {
          id: 123456789,
          first_name: 'Test',
          username: 'testuser',
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: command
      }
    };

    try {
      const webhookUrl = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      });

      const result = await response.json();
      console.log(`✅ ${command}: ${result.ok ? 'SUCCESS' : 'FAILED'}`);

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ ${command}: ERROR - ${error.message}`);
    }
  }
}

// Command line arguments
const command = process.argv[2];

if (command === 'commands') {
  testBotCommands();
} else {
  sendTestMessage();
}