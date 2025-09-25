# Telegram Bot Troubleshooting Guide

## 🚨 ISSUE IDENTIFIED!

The main issue has been identified: **Webhook URL Mismatch**

### Current Configuration:
```
Configured: https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret
Expected:   https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook
```

The webhook is configured with the secret parameter in the URL, but our code expects it as a query parameter. This mismatch is causing authentication failures.

---

## 🔧 Common Telegram Bot Issues

### 1. **Webhook Configuration Issues** ✅ IDENTIFIED
- **Problem**: Webhook URL includes secret parameter in the base URL
- **Solution**: Reconfigure webhook with correct URL format
- **Status**: NEEDS FIXING

### 2. **Bot Privacy Mode**
- **What it is**: Telegram bots in privacy mode only respond to commands starting with `/`
- **Impact**: Bot won't respond to regular messages, only commands
- **Check**: This is normal behavior and not the issue here

### 3. **User-Related Issues**
- **Bot not started**: User must send `/start` first
- **Bot blocked**: Check if bot is blocked in privacy settings
- **Marked as spam**: Bot might be marked as spam by user

### 4. **Group-Specific Issues**
- **Bot not in group**: Bot must be added to the group
- **No permissions**: Bot needs read permissions
- **Privacy mode**: Bot only responds to `/commands@botname` in groups

---

## 🛠️ SOLUTIONS

### Immediate Fix: Reconfigure Webhook

Run the following command to fix the webhook:

```bash
# Fix webhook configuration
curl -X POST "https://api.telegram.org/bot8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook",
    "secret_token": "web3jobs-telegram-webhook-secret"
  }'
```

### Verification Steps:

1. **Check webhook info**:
   ```bash
   curl "https://api.telegram.org/bot8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q/getWebhookInfo"
   ```

2. **Test connectivity**:
   ```bash
   curl -X POST "https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook?secret=web3jobs-telegram-webhook-secret" \
     -H "Content-Type: application/json" \
     -d '{"update_id": 123, "message": {"message_id": 1, "from": {"id": 999, "first_name": "Test"}, "chat": {"id": 999, "first_name": "Test", "type": "private"}, "date": 1234567890, "text": "/test"}}'
   ```

---

## 📋 Complete Troubleshooting Checklist

### ✅ WORKING:
- [x] Bot token is valid
- [x] Bot is accessible via API
- [x] Webhook endpoint is responding
- [x] Vercel deployment is successful
- [x] Edge Runtime is functioning
- [x] Performance tests pass

### ❌ NEEDS FIXING:
- [ ] Webhook URL configuration mismatch
- [ ] Secret token parameter handling

### 🔍 TO VERIFY:
- [ ] User has started conversation with `/start`
- [ ] Bot is not blocked by user
- [ ] No rate limiting issues
- [ ] Proper permissions in groups

---

## 🎯 Testing After Fix

Once webhook is reconfigured, test these commands:

1. `/start` - Should show welcome message
2. `/help` - Should show help information
3. `/latest` - Should show latest jobs
4. `/search solidity` - Should search for blockchain jobs
5. `/remote` - Should show remote jobs

---

## 🚀 Alternative Solution

If the above doesn't work, try using the `webhook-edge` endpoint:

```bash
curl -X POST "https://api.telegram.org/bot8454955176:AAHQDy1DjOp8vq3YBwUcFB7SD89BD-krC7Q/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app/api/telegram/webhook-edge"
  }'
```

This endpoint uses hardcoded secrets and might work better.

---

## 📞 Next Steps if Issues Persist

1. **Check BotFather settings**: Ensure bot is properly configured
2. **Verify bot permissions**: Make sure bot has necessary permissions
3. **Test with different users**: Rule out user-specific issues
4. **Check Telegram status**: Ensure no Telegram-wide outages
5. **Review rate limits**: Ensure not hitting API limits

---

**Most Likely Fix**: The webhook URL mismatch is the primary issue. Reconfiguring the webhook should resolve the problem.