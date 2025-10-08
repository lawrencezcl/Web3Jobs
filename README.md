# Web3 Remote Jobs — Next.js + Neon/Postgres + Vercel Cron + Telegram/Discord

A production-ready platform to automatically **collect Web3 remote jobs**, store in **Neon/Postgres**, expose a **Next.js** UI/API, run **Vercel Cron** ingestion, **push alerts** to **Telegram** & **Discord**, and **auto-post jobs to Telegram channels**.

**Live Site:** https://www.remotejobs.top

## 🚀 Latest Features

### 📱 Telegram Mini App
- **Full-featured Mini App** with job browsing and search
- **Telegram Web App integration** with haptic feedback
- **Job detail pages** with apply and share functionality
- **Real-time notifications** and subscription management
- **Mobile-optimized** UI for Telegram users

### 🤖 Automated Channel Posting
- **Auto-post to Telegram channels** (@web3jobs88)
- **Web3 job filtering** to ensure relevant content only
- **Smart job validation** and quality checks
- **Rate limiting protection** for Telegram API
- **Admin commands** for manual job posting

### 🎯 Admin Interface
- **Web admin panel** at `/admin` for manual job posting
- **Job validation** and preview before posting
- **Test ingestion** functionality with Web3 filtering
- **Real-time posting results** and error handling
- **Authentication** with secure token management

### 🔍 Enhanced Job Discovery
- **30+ data sources** including major crypto companies and VCs
- **Smart deduplication** and quality filtering
- **Advanced search** with tags, location, and salary filters
- **Real-time job alerts** for subscribers
- **Similar jobs recommendations**

### 📊 Enterprise Features
- **Monitoring dashboard** with system metrics
- **Error tracking** and alerting system
- **Performance optimization** with Edge Runtime
- **Scalable architecture** for high-volume job processing
- **Comprehensive logging** for debugging

- **Runtime**: Next.js 14 (App Router, Node.js functions + Edge Runtime)
- **Database**: Neon (Postgres) via Prisma ORM
- **Scheduler**: Vercel Cron (hits `/api/cron` every 3 hours)
- **Connectors**: 30+ sources including Lever, Greenhouse, RemoteOK, RSS feeds
- **Notifications**: Telegram Bot (webhook + sendMessage) & Discord (webhook)
- **Channel Posting**: Automated Web3 job posting to Telegram channels
- **UI**: Tailwind CSS + shadcn/ui-style primitives + Telegram Mini App
- **Admin**: Web-based admin panel for job management

---

## Quick Start

### 🐳 Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd web3-remote-jobs-vercel

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置数据库密码等

# 3. 一键部署（自动检测中国网络环境）
./scripts/deploy.sh

# 4. 访问应用
open http://localhost:3000
```

### 🇨🇳 中国大陆用户

如果遇到 Docker 镜像下载问题：

```bash
# 方法一：自动配置镜像源
./scripts/configure-mirrors.sh

# 方法二：使用专用的中国镜像版本
cp docker-compose.china.yml docker-compose.yml
docker-compose up -d

# 方法三：手动配置
./scripts/deploy.sh mirrors
```

### 🔧 传统部署方式

### 1) Neon + Prisma
1. Create a Neon project and copy the connection string (SSL required).
2. Copy `.env.example` to `.env` and fill the values:
```
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST/db?sslmode=require"

# Security
CRAWL_TOKEN="choose-a-strong-random-string"

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456:ABCDEF..."
TELEGRAM_WEBHOOK_SECRET="my-shared-secret"

# Channel Posting (NEW)
JOB_POSTING_TOKEN="your-job-posting-secret"
INGESTION_TOKEN="your-ingestion-secret"
ADMIN_USER_IDS="your-telegram-user-id-1,your-telegram-user-id-2"
```
3. Install deps and init DB:
```bash
npm i
npx prisma migrate deploy
```

### 2) Local Dev
```bash
npm run dev
```
Open http://localhost:3000

### 3) Deploy to Vercel
- Import this repo, set the same Environment Variables in Vercel Project Settings.
- `vercel.json` adds a cron to GET `/api/cron` every 3 hours.
- Manual ingestion: `POST /api/ingest?token=$CRAWL_TOKEN`
- The cron job now automatically posts Web3 jobs to Telegram channels
- Ensure environment variables are set for the production domain: `https://www.remotejobs.top`

### 4) Telegram Webhook & Channel Posting
Set webhook to your deployed URL:
```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/telegram/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>
```

**Bot Commands:**
- `/subscribe solidity, zk, cairo` - Subscribe to job alerts
- `/unsubscribe` - Unsubscribe from alerts
- `/search [query]` - Search jobs
- `/remote` - Show remote jobs only
- `/latest` - Show latest 5 jobs
- `/tags [tag]` - Search by tags
- `/stats` - View job statistics
- `/postjob {JSON}` - Admin: Post job to channel
- `/ingest` - Admin: Test job ingestion

**📖 Related Documentation:**
- [🤖 Telegram Setup Guide](./telegram-troubleshooting-guide.md) - Complete bot configuration
- [📱 Mini App Guide](./telegram-mini-app-guide.md) - Telegram Mini App setup
- [📢 Channel Posting](./TELEGRAM_CHANNEL_POSTING.md) - Automated channel posting

**Channel Features:**
- Automatic Web3 job posting every 3 hours
- Smart filtering for blockchain/crypto relevance
- Admin commands for manual posting
- Job validation and quality checks

### 5) Discord (optional)
Create a channel webhook. Then:
```bash
curl -X POST https://<app>/api/subscriptions -H 'content-type: application/json' -d '{
  "type":"discord",
  "identifier":"https://discord.com/api/webhooks/..../...",
  "topics":"solidity,remote"
}'
```

---

## API Endpoints

### Job Management
- `GET /api/jobs` – List/search jobs (`q`, `tag`, `source`, `remote`, `page`, `limit`)
- `GET /api/cron` – Cron ingestion endpoint (posts Web3 jobs to channel)
- `POST /api/ingest?token=CRAWL_TOKEN` – Manual job ingestion
- `GET /api/filters` – Get available filters and tags

### Channel Posting (NEW)
- `POST /api/ingest-job` – Ingest and auto-post Web3 job to channel
  - Headers: `X-API-Key: INGESTION_TOKEN` or `Authorization: Bearer INGESTION_TOKEN`
  - Body: Job data with Web3 filtering applied
- `POST /api/post-job-to-channel` – Direct job posting to channel
  - Headers: `Authorization: Bearer JOB_POSTING_TOKEN`
  - Body: Complete job data

### Telegram Integration
- `POST /api/telegram/webhook?secret=TELEGRAM_WEBHOOK_SECRET` – Telegram bot updates
- `GET /api/telegram/debug` – Debug Telegram webhook

### Admin Interface
- `GET /admin` – Web admin panel for manual job posting
- `POST /api/ingest-job` – Test ingestion with Web3 filtering
- Admin commands available in Telegram: `/postjob`, `/ingest`

### Subscriptions
- `POST /api/subscriptions` – Add subscriber `{type, identifier, topics?}`
- `DELETE /api/subscriptions` – Remove subscriber `{type, identifier}`

### Monitoring
- `GET /api/health` – System health check
- `GET /api/env-test` – Environment validation

---

## Architecture Notes

### Data Processing
- **Deduplication**: SHA‑256 of `title|company|url` as `Job.id`
- **Web3 Filtering**: Jobs are filtered for blockchain/crypto relevance before posting
- **Quality Control**: Salary extraction, location parsing, seniority level detection
- **Smart Validation**: URL validation, title length checks, company name verification

### Channel Posting System
- **Automatic Posting**: Cron job collects jobs and posts Web3-related ones to channels
- **Web3 Keywords**: blockchain, solidity, web3, defi, nft, cryptocurrency, bitcoin, ethereum, smart contract, dapp, dao, metaverse, gamefi, staking, yield, liquidity, trading, exchange, wallet, token
- **Rate Limiting**: 1-second delay between posts to avoid Telegram API limits
- **Error Handling**: Failed posts are logged but don't stop the ingestion process

### Telegram Mini App
- **Native Integration**: Uses Telegram Web App SDK for haptic feedback and native features
- **Responsive Design**: Optimized for mobile viewing within Telegram
- **Job Actions**: Apply, share, and save functionality
- **Real-time Updates**: Live job data with filtering and search

### Admin Features
- **Authentication**: Admin user IDs for secure access to posting commands
- **Job Validation**: Comprehensive validation before posting to channels
- **Test Environment**: Ingestion testing with Web3 filtering
- **Monitoring**: Real-time posting results and error tracking

### Performance Optimizations
- **Edge Runtime**: Selected endpoints use Edge Runtime for global distribution
- **Caching**: Strategic caching for frequently accessed data
- **Database Optimization**: Indexed queries and connection pooling
- **Error Recovery**: Automatic retry mechanisms for failed operations

### Development Notes
- **RSS Parser**: Simple but effective for most Web3 job feeds
- **UI Components**: Custom primitives compatible with shadcn/ui
- **Database Migrations**: Prisma migrations for schema changes
- **Environment Variables**: Comprehensive configuration options
- **Testing**: Jest and React Testing Library setup provided

To switch to official shadcn/ui components: `npx shadcn@latest init` then add `button input card badge` and replace the primitives in `src/components/ui`.

## 🌟 Platform Highlights

### ✅ Current Features
- **Modern UI/UX**: Professional gradient design with responsive layout
- **Real-time Search**: Advanced filtering by tags, location, salary, and date range
- **Job Aggregation**: 30+ data sources including major crypto companies
- **Telegram Integration**: Bot commands and automated channel posting
- **Admin Panel**: Web interface for manual job posting and testing
- **Mobile Optimized**: Telegram Mini App for on-the-go job browsing
- **Performance**: Edge Runtime optimization and strategic caching

### 🚀 Coming Soon
- **Job Alerts**: Email notifications for personalized job matches
- **Company Profiles**: Detailed company information and reviews
- **Salary Insights**: Comprehensive salary analysis and benchmarks
- **Application Tracking**: User accounts and application management
- **PWA Support**: Offline capabilities and mobile app experience

## 🎯 Platform Architecture

```
Frontend (Next.js 14)
├── Modern Homepage with hero section
├── Advanced job search and filtering
├── Job detail pages with apply functionality
├── Admin interface for job management
└── Telegram Mini App integration

Backend (API Routes)
├── Job aggregation from 30+ sources
├── Real-time search and filtering
├── Telegram bot and channel posting
├── Discord webhook integration
└── Admin endpoints for manual posting

Data Layer
├── Neon PostgreSQL with Prisma ORM
├── Automated deduplication and validation
├── Indexed queries for performance
└── Scheduled backups and monitoring

Infrastructure
├── Vercel hosting with Edge Runtime
├── Vercel Cron for scheduled tasks
├── Analytics and error tracking
└── CI/CD with automated testing
```

**📚 Additional Resources:**
- [🚀 Production Deployment](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Step-by-step deployment guide
- [📋 Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre-launch verification
- [🔧 Docker Setup](./DEPLOYMENT.md) - Docker deployment instructions
- [📊 UI Testing Report](./UI-UX-Testing-Report.md) - Quality assurance results
- [📈 Analytics Setup](./VERCEL_ANALYTICS_TROUBLESHOOTING.md) - Performance monitoring
- [🧪 Mock Testing](./MOCK_TEST_GUIDE.md) - Development testing guide

## 📞 Support & Community

- **Live Site:** https://www.remotejobs.top
- **Telegram Channel:** @web3jobs88
- **Issues & Feature Requests:** Use GitHub Issues
- **Community Discord:** [Join our Discord](https://discord.gg/web3jobs)
