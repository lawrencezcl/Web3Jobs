# Web3 Jobs API Documentation

Complete API reference for the Web3 Jobs platform including job management, Telegram integration, and admin functionality.

## 🔑 Authentication

### Bearer Token Authentication
```bash
-H "Authorization: Bearer your-token"
```

### API Key Authentication
```bash
-H "X-API-Key: your-token"
```

### Query Parameter Authentication
```bash
POST /api/ingest?token=your-token
```

## 📊 Base URL

```
https://your-app.vercel.app
```

## 🏢 Job Management APIs

### GET /api/jobs

List and search jobs with advanced filtering.

**Query Parameters:**
- `q` (string) - Search query for title/company/description
- `tag` (string) - Filter by tag
- `source` (string) - Filter by source
- `remote` (boolean) - Remote jobs only
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 20, max: 100)

**Example:**
```bash
curl "https://your-app.vercel.app/api/jobs?q=blockchain&tag=solidity&remote=true&page=1&limit=10"
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "abc123",
      "title": "Senior Blockchain Developer",
      "company": "CryptoTech Inc",
      "location": "Remote",
      "remote": true,
      "salary": "$120k - $180k",
      "employmentType": "Full-time",
      "postedAt": "2024-01-15T10:00:00Z",
      "url": "https://example.com/job",
      "tags": ["blockchain", "solidity", "web3"],
      "description": "Looking for experienced blockchain developer...",
      "source": "lever:ledger"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "hasMore": true
  }
}
```

### GET /api/filters

Get available filters and tags for search.

**Response:**
```json
{
  "tags": ["blockchain", "solidity", "defi", "nft", "web3"],
  "sources": ["lever:ledger", "greenhouse:coinbase", "remoteok"],
  "employmentTypes": ["Full-time", "Part-time", "Contract", "Freelance"],
  "locations": ["Remote", "San Francisco", "New York", "London"]
}
```

## 🤖 Channel Posting APIs

### POST /api/ingest-job

Ingest a job and automatically post to Telegram channel if it's Web3-related.

**Authentication:**
- `X-API-Key: INGESTION_TOKEN`
- `Authorization: Bearer INGESTION_TOKEN`

**Request Body:**
```json
{
  "title": "Senior Blockchain Developer (required)",
  "company": "CryptoTech Inc (required)",
  "description": "Job description (required)",
  "location": "Remote (optional)",
  "remote": true,
  "salary": "$120k - $180k",
  "employmentType": "Full-time",
  "url": "https://example.com/job",
  "applyUrl": "https://example.com/apply",
  "tags": ["blockchain", "solidity", "web3"]
}
```

**Response (Success - Web3 job):**
```json
{
  "success": true,
  "message": "Job ingested and posted to channel successfully",
  "jobId": "job_123456",
  "processingTime": 1234,
  "posted": true,
  "channel": "@web3jobs88"
}
```

**Response (Filtered - Non-Web3 job):**
```json
{
  "success": false,
  "message": "Job filtered out - not Web3 related",
  "jobId": "job_123456",
  "filtered": true
}
```

### POST /api/post-job-to-channel

Direct job posting to Telegram channel (bypasses Web3 filtering).

**Authentication:**
- `Authorization: Bearer JOB_POSTING_TOKEN`

**Request Body:**
```json
{
  "id": "manual_123",
  "title": "Job Title (required)",
  "company": "Company Name (required)",
  "location": "Location (required)",
  "remote": true,
  "salary": "Salary Range",
  "employmentType": "Full-time",
  "postedAt": "2024-01-15T10:00:00Z",
  "url": "Job URL (required)",
  "applyUrl": "Application URL",
  "tags": ["tag1", "tag2"],
  "description": "Job description (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job posted to channel successfully",
  "jobId": "manual_123",
  "processingTime": 567
}
```

## 📱 Telegram Integration APIs

### POST /api/telegram/webhook

Telegram bot webhook for handling commands and interactions.

**Authentication:**
- Query parameter: `secret=TELEGRAM_WEBHOOK_SECRET`

**Webhook Setup:**
```bash
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook?secret=<YOUR_SECRET>
```

### GET /api/telegram/debug

Debug Telegram webhook configuration and connectivity.

**Response:**
```json
{
  "webhook": {
    "url": "https://your-app.vercel.app/api/telegram/webhook?secret=your-secret",
    "hasCustomCertificate": false,
    "pendingUpdateCount": 0,
    "lastErrorDate": null,
    "lastErrorMessage": null
  },
  "bot": {
    "id": 123456789,
    "firstName": "Web3JobsBot",
    "username": "Web3job88bot"
  }
}
```

## 🏛️ Admin APIs

### GET /admin

Web interface for manual job posting and testing.

**Authentication:**
- None (web interface handles auth)

### Admin Telegram Commands

These commands are available to admin users specified in `ADMIN_USER_IDS`:

#### /postjob {JSON_DATA}

Manually post a job to the channel.

**Format:**
```
/postjob {"title":"Job Title","company":"Company","description":"Description..."}
```

#### /ingest

Test job ingestion and Web3 filtering.

**Format:**
```
/ingest
```

## 🔄 System APIs

### GET /api/cron

Cron job endpoint for Vercel scheduled ingestion and posting.

**Authentication:** None (secured by Vercel cron configuration)

**Response:**
```json
{
  "ok": true,
  "inserted": 66,
  "notifiedJobs": 66,
  "postedToChannel": 12,
  "sources": [
    "wellfound",
    "techboards",
    "cryptoboards",
    "greenhouse:usv",
    "lever:ledger"
  ],
  "errors": 0,
  "duration": 15912
}
```

### POST /api/ingest

Manual job ingestion (legacy endpoint).

**Authentication:**
- Query parameter: `token=CRAWL_TOKEN`

### GET /api/health

System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "telegram": "connected"
}
```

### GET /api/env-test

Environment validation and configuration test.

**Response:**
```json
{
  "valid": true,
  "checks": {
    "database": "✅ Connected",
    "telegram": "✅ Configured",
    "tokens": "✅ All present",
    "webhook": "✅ Configured"
  },
  "warnings": [],
  "errors": []
}
```

## 📢 Subscription APIs

### POST /api/subscriptions

Add a new subscriber for job alerts.

**Request Body:**
```json
{
  "type": "telegram",
  "identifier": "123456789",
  "topics": "solidity,defi,blockchain"
}
```

**Response:**
```json
{
  "success": true,
  "subscriberId": "telegram:123456789",
  "topics": ["solidity", "defi", "blockchain"]
}
```

### DELETE /api/subscriptions

Remove a subscriber.

**Request Body:**
```json
{
  "type": "telegram",
  "identifier": "123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscriber removed successfully"
}
```

## 🚨 Error Responses

All APIs return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "success": false,
  "details": "Field 'title' is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "success": false
}
```

### 404 Not Found
```json
{
  "error": "Endpoint not found",
  "success": false
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "success": false,
  "details": "Database connection failed"
}
```

## 📈 Rate Limiting

- **Telegram API**: 1 second delay between posts
- **Database**: Connection pooling with reasonable limits
- **External APIs**: Respective rate limits of data sources

## 🔄 Webhook Events

### Telegram Webhook Events

The webhook handles these events:
- Message commands (/start, /help, /search, etc.)
- Job subscriptions
- Admin commands
- Callback queries

**Sample Update:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 123,
    "from": {
      "id": 123456789,
      "first_name": "John",
      "username": "john_doe"
    },
    "chat": {
      "id": 123456789,
      "first_name": "John",
      "username": "john_doe",
      "type": "private"
    },
    "date": 1642248600,
    "text": "/search blockchain developer"
  }
}
```

## 🧪 Testing

### Test Job Ingestion
```bash
# Test with a Web3 job
curl -X POST https://your-app.vercel.app/api/ingest-job \
  -H "X-API-Key: your-token" \
  -d '{
    "title": "Blockchain Developer",
    "company": "Test Company",
    "description": "Looking for blockchain developer with Solidity experience",
    "tags": ["blockchain", "solidity"]
  }'

# Test with non-Web3 job (should be filtered)
curl -X POST https://your-app.vercel.app/api/ingest-job \
  -H "X-API-Key: your-token" \
  -d '{
    "title": "Marketing Manager",
    "company": "Traditional Corp",
    "description": "Traditional marketing role",
    "tags": ["marketing", "management"]
  }'
```

### Test Direct Posting
```bash
curl -X POST https://your-app.vercel.app/api/post-job-to-channel \
  -H "Authorization: Bearer your-token" \
  -d '{
    "id": "test_123",
    "title": "Test Job Posting",
    "company": "Test Company",
    "description": "This is a test job posting",
    "location": "Remote",
    "remote": true,
    "salary": "$100k",
    "employmentType": "Full-time",
    "postedAt": "'$(date -Iseconds)'",
    "url": "https://example.com",
    "tags": ["test"],
    "description": "Test description"
  }'
```

## 📚 SDK/Client Libraries

Currently, this API is designed for direct HTTP integration. Future releases may include:

- JavaScript/TypeScript SDK
- Python client library
- Webhooks for real-time updates
- GraphQL API alternative

## 🔒 Security Best Practices

1. **Token Management**: Use environment variables, never commit tokens
2. **HTTPS Only**: All endpoints require HTTPS
3. **Rate Limiting**: Built-in protection against abuse
4. **Input Validation**: All inputs are validated and sanitized
5. **CORS**: Configured for web frontend access
6. **Authentication**: Multiple auth methods for different use cases

## 📞 Support

For API issues:
1. Check Vercel function logs
2. Test with the examples above
3. Verify environment variables
4. Review authentication tokens
5. Check rate limiting status

**📚 Related Documentation:**
- [🚀 Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Complete setup instructions
- [📢 Telegram Integration](./TELEGRAM_CHANNEL_POSTING.md) - Bot and channel setup
- [🔧 Troubleshooting](./telegram-troubleshooting-guide.md) - Common issues and solutions
- [📱 Mini App Development](./telegram-mini-app-guide.md) - Telegram Mini App integration