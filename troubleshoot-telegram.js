#!/usr/bin/env node

// Telegram Bot Troubleshooting Script
// Based on common issues found in Telegram Bot API documentation

const BOT_TOKEN = '8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q';
const WEBHOOK_URL = 'https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook';

console.log('🔧 Telegram Bot Troubleshooting');
console.log('=============================');

async function checkWebhookInfo() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const data = await response.json();

    console.log('📡 Current Webhook Configuration:');
    console.log('================================');
    console.log(JSON.stringify(data, null, 2));

    if (data.result.url) {
      console.log('\n✅ Webhook is set to:', data.result.url);

      // Check if webhook URL matches our expected URL
      if (data.result.url === WEBHOOK_URL) {
        console.log('✅ Webhook URL matches expected configuration');
      } else {
        console.log('❌ Webhook URL does not match expected configuration');
        console.log('Expected:', WEBHOOK_URL);
      }
    } else {
      console.log('❌ No webhook is configured');
    }

    if (data.result.last_error_message) {
      console.log('\n❌ Last webhook error:', data.result.last_error_message);
      console.log('Error occurred at:', new Date(data.result.last_error_date * 1000).toISOString());
    }

    if (data.result.pending_update_count > 0) {
      console.log('\n⚠️ Pending updates:', data.result.pending_update_count);
      console.log('This suggests the webhook is not processing messages properly');
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to get webhook info:', error.message);
    return null;
  }
}

async function deleteWebhook() {
  try {
    console.log('\n🗑️ Deleting current webhook...');
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook deleted successfully');
    } else {
      console.log('❌ Failed to delete webhook:', data.description);
    }

    return data.ok;
  } catch (error) {
    console.error('❌ Failed to delete webhook:', error.message);
    return false;
  }
}

async function setWebhook() {
  try {
    console.log('\n⚙️ Setting new webhook...');
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        secret_token: 'web3jobs-telegram-webhook-secret'
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Webhook set successfully');
      console.log('URL:', WEBHOOK_URL);
      console.log('Secret token: web3jobs-telegram-webhook-secret');
    } else {
      console.log('❌ Failed to set webhook:', data.description);
    }

    return data.ok;
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
    return false;
  }
}

async function testWebhookConnectivity() {
  try {
    console.log('\n🔗 Testing webhook endpoint connectivity...');

    // Test with the webhook endpoint
    const testPayload = {
      update_id: Date.now(),
      message: {
        message_id: 1,
        from: {
          id: 999999999,
          is_bot: false,
          first_name: 'Test',
          username: 'test'
        },
        chat: {
          id: 999999999,
          first_name: 'Test',
          username: 'test',
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: '/test'
      }
    };

    const response = await fetch(`${WEBHOOK_URL}?secret=web3jobs-telegram-webhook-secret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      console.log('✅ Webhook endpoint is reachable and responding');
      console.log('Response status:', response.status);
    } else {
      console.log('❌ Webhook endpoint returned error:', response.status, response.statusText);
    }

    return response.ok;
  } catch (error) {
    console.error('❌ Webhook connectivity test failed:', error.message);
    return false;
  }
}

async function checkBotInfo() {
  try {
    console.log('\n🤖 Checking bot information...');
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();

    if (data.ok) {
      console.log('✅ Bot is accessible');
      console.log('Bot Name:', data.result.first_name);
      console.log('Bot Username:', data.result.username);
      console.log('Bot ID:', data.result.id);

      if (data.result.can_read_all_group_messages) {
        console.log('✅ Bot can read all group messages');
      } else {
        console.log('ℹ️ Bot cannot read all group messages (normal for privacy)');
      }

      if (data.result.supports_inline_queries) {
        console.log('✅ Bot supports inline queries');
      }
    } else {
      console.log('❌ Failed to get bot info:', data.description);
    }

    return data.ok;
  } catch (error) {
    console.error('❌ Failed to check bot info:', error.message);
    return false;
  }
}

// Common issues checklist
function displayCommonIssues() {
  console.log('\n📋 Common Issues Checklist:');
  console.log('========================');

  const issues = [
    '✅ Webhook URL is accessible and returns HTTP 200',
    '❓ Bot privacy mode is enabled (bot only responds to commands starting with /)',
    '❓ Bot is blocked by the user',
    '❓ User has not started a conversation with the bot',
    '❓ Bot is not a member of the group (for group messages)',
    '❓ Bot does not have permission to read messages in the group',
    '❓ Webhook secret is not configured correctly',
    '❓ SSL certificate issues for self-signed certificates',
    '❓ Firewall blocking Telegram servers',
    '❓ Rate limiting by Telegram API',
    '❓ Bot token is invalid or revoked',
    '❓ Webhook URL is returning errors or timeouts'
  ];

  issues.forEach(issue => console.log('•', issue));
}

async function main() {
  console.log('🔍 Starting comprehensive troubleshooting...\n');

  // Step 1: Check bot info
  await checkBotInfo();

  // Step 2: Check current webhook configuration
  await checkWebhookInfo();

  // Step 3: Test webhook connectivity
  await testWebhookConnectivity();

  // Step 4: Display common issues
  displayCommonIssues();

  console.log('\n🎯 Recommended Actions:');
  console.log('====================');
  console.log('1. Ensure you have started a conversation with the bot by sending /start');
  console.log('2. Check if the bot is blocked in your Telegram settings');
  console.log('3. Verify the bot has not been marked as spam');
  console.log('4. Try sending a simple command like /help or /start');
  console.log('5. Check if you\'re testing in a group where the bot is a member');

  console.log('\n📞 If issues persist:');
  console.log('====================');
  console.log('• Contact Telegram Bot Support');
  console.log('• Check BotFather settings');
  console.log('• Verify bot token is still valid');
}

main().catch(console.error);