# Web3 Remote Jobs — Next.js + Neon/Postgres + Vercel Cron + Telegram/Discord

A production-ready starter to automatically **collect Web3 remote jobs**, store in **Neon/Postgres**, expose a **Next.js** UI/API, run **Vercel Cron** ingestion, and **push alerts** to **Telegram** & **Discord**.

## ✨ New Features Added

### 🔍 Enhanced Job Details
- **Job detail pages** with SEO optimization and Open Graph cards
- **Advanced filtering**: salary range, country, seniority level
- **Enhanced search** with multiple filter combinations
- **Responsive design** improvements

### 🌐 Extended Data Sources
- **RSS feeds support** with 6 Web3 job RSS sources configured
- **Improved error handling** with retry mechanisms
- **Better data parsing** for salary, location, and seniority extraction

### 📊 Monitoring & Analytics
- **Crawl monitoring** with detailed logging
- **System metrics** API for performance tracking
- **Error tracking** and reporting
- **Database performance** optimization

### 🧪 Testing & Quality
- **Comprehensive test suite** with Jest and React Testing Library
- **API endpoint testing** with mocked Prisma
- **Component testing** for UI elements
- **Code coverage reporting**

### 📚 Complete Documentation
- **Detailed deployment guide** (`DEPLOYMENT.md`)
- **API key acquisition** step-by-step instructions
- **Troubleshooting guide** for common issues
- **Cost estimation** and scaling recommendations

- Runtime: Next.js 14 (App Router, Node.js functions)
- DB: Neon (Postgres) via Prisma
- Scheduler: Vercel Cron (hits `/api/cron` every 3 hours)
- Connectors: Lever, Greenhouse, RemoteOK (optional), RSS (naive parser)
- Notifications: Telegram Bot (webhook + sendMessage) & Discord (webhook)
- UI: Tailwind + shadcn/ui-style primitives (Button/Input/Card/Badge). You can swap to real shadcn components later.

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
DATABASE_URL="postgresql://USER:PASSWORD@HOST/db?sslmode=require"
CRAWL_TOKEN="choose-a-strong-random-string"

# Telegram (optional)
TELEGRAM_BOT_TOKEN="123456:ABCDEF..."
TELEGRAM_WEBHOOK_SECRET="my-shared-secret"
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

### 4) Telegram Webhook (optional)
Set webhook to your deployed URL:
```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<your-app>.vercel.app/api/telegram/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>
```
Bot commands:
- `/subscribe solidity, zk, cairo`
- `/unsubscribe`

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

## API
- `GET /api/jobs` – list/search (`q`, `tag`, `source`, `remote`, `page`, `limit`)
- `GET /api/cron` – ingestion endpoint for Vercel Cron
- `POST /api/ingest?token=CRAWL_TOKEN` – manual ingestion
- `POST /api/subscriptions` – add subscriber `{type, identifier, topics?}`
- `DELETE /api/subscriptions` – remove subscriber `{type, identifier}`
- `POST /api/telegram/webhook?secret=TELEGRAM_WEBHOOK_SECRET` – Telegram updates

---

## Notes
- Dedupe by SHA‑256 of `title|company|url` as `Job.id`.
- Notifications match if any topic keyword appears in title/company/tags/description.
- RSS parser is intentionally simple; plug a robust XML parser if you depend on RSS heavily.
- To switch to official shadcn/ui components: `npx shadcn@latest init` then add `button input card badge` and replace the primitives in `src/components/ui`.
