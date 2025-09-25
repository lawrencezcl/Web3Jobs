# Telegram Channel Posting Guide

This guide explains how to set up and use the automated Telegram channel posting feature for Web3 jobs.

## 🚀 Overview

The Web3 Jobs platform now automatically posts relevant Web3 jobs to your Telegram channels. This feature includes:

- **Automatic posting** via cron job every 3 hours
- **Web3 filtering** to ensure only relevant jobs are posted
- **Admin commands** for manual posting
- **Web admin interface** for job management
- **Smart validation** and quality checks

## 🔧 Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# Channel Posting Tokens
JOB_POSTING_TOKEN="your-secure-job-posting-token"
INGESTION_TOKEN="your-secure-ingestion-token"

# Admin Configuration
ADMIN_USER_IDS="your-telegram-user-id-1,your-telegram-user-id-2"

# Telegram Bot (existing)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_WEBHOOK_SECRET="your-webhook-secret"
```

### 2. Get Admin User IDs

To get your Telegram user ID:

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your user ID in the response

## 📱 Admin Commands

### Telegram Bot Commands

**For Admin Users Only:**
- `/postjob {JSON_DATA}` - Post a job to channel manually
- `/ingest` - Test job ingestion with Web3 filtering

**Example:**
```
/postjob {
  "title": "Senior Blockchain Developer",
  "company": "CryptoTech Inc",
  "description": "Looking for experienced blockchain developer...",
  "salary": "$120k - $180k",
  "location": "Remote",
  "remote": true,
  "tags": ["blockchain", "solidity"],
  "url": "https://example.com/job"
}
```

### Web Admin Interface

Visit `/admin` on your deployed site for:
- Manual job posting form
- Job validation and preview
- Test ingestion functionality
- Real-time posting results

## 🔌 API Usage

### 1. Job Ingestion with Auto-Posting

```bash
curl -X POST https://your-app.vercel.app/api/ingest-job \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-ingestion-token" \
  -d '{
    "title": "Smart Contract Developer",
    "company": "DeFi Labs",
    "description": "Experienced Solidity developer needed...",
    "location": "Remote",
    "remote": true,
    "salary": "$140k - $200k",
    "employmentType": "Full-time",
    "url": "https://example.com/job",
    "tags": ["solidity", "defi", "smart-contracts"]
  }'
```

### 2. Direct Channel Posting

```bash
curl -X POST https://your-app.vercel.app/api/post-job-to-channel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-job-posting-token" \
  -d '{
    "id": "manual_123",
    "title": "Blockchain Engineer",
    "company": "Web3 Studios",
    "location": "Remote",
    "remote": true,
    "salary": "$130k - $170k",
    "employmentType": "Full-time",
    "postedAt": "2024-01-15T10:00:00Z",
    "url": "https://example.com/job",
    "applyUrl": "https://example.com/apply",
    "tags": ["blockchain", "web3", "engineering"],
    "description": "Join our team to build the future of Web3..."
  }'
```

## 🎯 Web3 Filtering

Jobs are automatically filtered for Web3 relevance using these keywords:

### Core Blockchain
- blockchain, solidity, web3, smart contract, dapp, dao
- bitcoin, ethereum, cryptocurrency, crypto, defi, nft
- metaverse, gamefi, play2earn

### DeFi & Trading
- staking, yield, liquidity, trading, exchange
- wallet, token, ico, ido, liquidity mining

### Development
- rust, go, elixir, move (for blockchain development)
- zero-knowledge, zk proofs, cryptography

**Filter Logic:**
- Job must contain at least one Web3 keyword in: title, company, description, or tags
- Non-Web3 jobs are silently ignored (logged for debugging)
- Filtering is case-insensitive

## 📊 Monitoring

### Cron Job Results

The cron job (`/api/cron`) returns:

```json
{
  "ok": true,
  "inserted": 66,
  "notifiedJobs": 66,
  "postedToChannel": 12,
  "sources": ["wellfound", "techboards", "cryptoboards", ...],
  "errors": 0,
  "duration": 15912
}
```

### Logging

Check Vercel logs for:
- `✅ Posting Web3 job to channel: [title] at [company]`
- `✅ Successfully posted: [title]`
- `❌ Failed to post: [title]`
- `⚠️ Job filtered out (not Web3 related): [title]`

## 🔍 Troubleshooting

### Jobs Not Posting to Channel

1. **Check if jobs are Web3-related**
   - Look for "Job filtered out" messages in logs
   - Ensure job contains Web3 keywords

2. **Verify environment variables**
   - `JOB_POSTING_TOKEN` must match between cron job and posting endpoint
   - `TELEGRAM_BOT_TOKEN` must be valid

3. **Check Telegram Bot permissions**
   - Bot must be admin in the target channel
   - Bot must have posting permissions

4. **Test manually**
   ```bash
   # Test ingestion endpoint
   curl -X POST https://your-app.vercel.app/api/ingest-job \
     -H "X-API-Key: your-token" \
     -d '{"title":"Blockchain Developer","company":"Test","description":"blockchain"}'

   # Test direct posting
   curl -X POST https://your-app.vercel.app/api/post-job-to-channel \
     -H "Authorization: Bearer your-token" \
     -d '{"title":"Test","company":"Test","description":"test"}'
   ```

### Rate Limiting Issues

The system includes automatic rate limiting:
- 1-second delay between posts
- Failed posts don't stop processing
- Check logs for Telegram API errors

### Deployment Issues

If new endpoints return 404:
1. Check GitHub Actions deployment status
2. Ensure all commits are pushed
3. Wait for Vercel deployment to complete
4. Test with `GET /api/cron` first (should always work)

## 📈 Performance

### Current Capabilities
- **30+ data sources** monitored
- **60-100 jobs** collected per run
- **10-20 Web3 jobs** typically posted per run
- **3-hour cron schedule**
- **15-second processing time** typical

### Scaling Considerations
- Add more data sources as needed
- Adjust cron frequency (min 1 hour)
- Monitor Telegram API rate limits
- Consider multiple channels for different job categories

## 🎨 Customization

### Adding New Web3 Keywords

Edit `src/app/api/ingest-job/route.ts`:

```typescript
const web3Keywords = [
  // existing keywords...
  'your-new-keyword',  // Add new keywords here
]
```

### Custom Channel Targets

Edit `src/app/api/post-job-to-channel/route.ts`:

```typescript
async function sendToTelegramChannel(message: string, chatId: string = '@your-channel') {
  // Change default chatId or make it configurable
}
```

### Custom Filtering Logic

Modify the `isWeb3Job` function to implement custom filtering rules.

## 🔒 Security

### Token Security
- Use strong, random tokens
- Rotate tokens periodically
- Don't commit tokens to git
- Use different tokens for different purposes

### Admin Security
- Limit admin users to trusted individuals
- Use Telegram user IDs, not usernames
- Monitor admin command usage
- Remove former admins promptly

## 📞 Support

For issues:
1. Check Vercel function logs
2. Test with manual commands
3. Verify environment variables
4. Review this documentation
5. Check GitHub issues for similar problems