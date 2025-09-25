#!/usr/bin/env node

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q';
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'web3jobs-telegram-webhook-secret';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook';

async function setupWebhook() {
  try {
    console.log('🤖 Setting up Telegram webhook...');

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `${WEBHOOK_URL}?secret=${TELEGRAM_WEBHOOK_SECRET}`,
        allowed_updates: ['message', 'edited_message'],
        drop_pending_updates: true
      })
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`📡 Webhook URL: ${WEBHOOK_URL}?secret=${TELEGRAM_WEBHOOK_SECRET}`);
      console.log(`🔒 Secret: ${TELEGRAM_WEBHOOK_SECRET}`);

      // Get webhook info
      const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
      const infoResponse = await fetch(infoUrl);
      const webhookInfo = await infoResponse.json();

      console.log('\n📋 Webhook Information:');
      console.log(JSON.stringify(webhookInfo, null, 2));

      // Get bot info
      const botUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
      const botResponse = await fetch(botUrl);
      const botInfo = await botResponse.json();

      console.log('\n🤖 Bot Information:');
      console.log(`Name: ${botInfo.result.first_name}`);
      console.log(`Username: @${botInfo.result.username}`);
      console.log(`ID: ${botInfo.result.id}`);

    } else {
      console.error('❌ Failed to set webhook:', result);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error setting up webhook:', error);
    process.exit(1);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Deleting existing webhook...');

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', result);
    }

  } catch (error) {
    console.error('❌ Error deleting webhook:', error);
  }
}

// Command line arguments
const command = process.argv[2];

if (command === 'delete') {
  deleteWebhook();
} else if (command === 'info') {
  // Just get webhook info without setting
  const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
  fetch(infoUrl)
    .then(response => response.json())
    .then(info => {
      console.log('📋 Current Webhook Info:');
      console.log(JSON.stringify(info, null, 2));
    })
    .catch(error => console.error('❌ Error getting webhook info:', error));
} else {
  setupWebhook();
}