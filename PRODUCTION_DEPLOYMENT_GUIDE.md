# 🚀 Web3 Remote Jobs - Production Deployment Guide

## Current Status ✅
Your project is now **READY FOR DEPLOYMENT** with the following configurations:
- ✅ Environment variables configured with secure secrets
- ✅ Prisma schema updated for PostgreSQL (Neon compatible)
- ✅ Production environment file created
- ✅ All deployment files configured

---

## 🎯 Recommended: Vercel + Neon Deployment

### Prerequisites
1. GitHub account (for code hosting)
2. Vercel account (free tier available)
3. Neon account (free tier available)

---

## Step 1: Upload to GitHub

Since Git is not installed locally, you'll need to upload manually:

1. **Create a new GitHub repository**:
   - Go to https://github.com/new
   - Repository name: `web3-remote-jobs-production`
   - Set to Public or Private
   - **DO NOT** initialize with README

2. **Upload your project**:
   - Click "uploading an existing file"
   - Select ALL files from: `c:\Users\Administrator\Downloads\Web3Jobs-main\Web3Jobs-main`
   - **IMPORTANT**: Exclude the `.env` file (contains secrets)
   - Add commit message: "Initial production deployment setup"
   - Click "Commit changes"

---

## Step 2: Set up Neon Database

1. **Create Neon account**:
   - Visit: https://console.neon.tech/
   - Sign up with GitHub (recommended)

2. **Create database project**:
   - Click "Create Project"
   - Project name: `web3-remote-jobs`
   - Region: Choose closest to your users (US East recommended)
   - PostgreSQL version: 15
   - Click "Create Project"

3. **Get connection string**:
   - In dashboard, click "Connection Details"
   - Copy the **Connection String** (looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   - **Save this URL** - you'll need it for Vercel

---

## Step 3: Deploy to Vercel

1. **Create Vercel account**:
   - Visit: https://vercel.com/signup
   - Sign up with GitHub (recommended)

2. **Import your project**:
   - Click "New Project"
   - Import your GitHub repository: `web3-remote-jobs-production`
   - Click "Deploy"

3. **Configure environment variables**:
   - Go to Project Settings → Environment Variables
   - Add these variables:

   | Variable Name | Value | Notes |
   |---------------|-------|-------|
   | `DATABASE_URL` | `postgresql://...` | Your Neon connection string |
   | `CRON_SECRET` | `YFkqfetMl983PWpBDo0Sh1JArRKUXOT6` | From your .env file |
   | `CRAWL_TOKEN` | `0jzcV7Jt2C6Nmi8PLTAld9uKR1DYZg5Q` | From your .env file |
   | `NODE_ENV` | `production` | Production environment |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Will be provided by Vercel |

4. **Redeploy with environment variables**:
   - Go to Deployments tab
   - Click "..." → "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

---

## Step 4: Initialize Database

After deployment succeeds:

1. **Open Vercel Functions**:
   - Go to your Vercel project dashboard
   - Click "Functions" tab

2. **Run database migration**:
   - The app will automatically run migrations on first startup
   - If needed, trigger manually via: `https://your-app.vercel.app/api/health`

---

## Step 5: Test Your Deployment

### Basic Functionality Test
Visit these URLs (replace `your-app.vercel.app` with your actual domain):

1. **Homepage**: `https://your-app.vercel.app`
2. **Health Check**: `https://your-app.vercel.app/api/health`
3. **Jobs API**: `https://your-app.vercel.app/api/jobs?limit=5`
4. **Manual Job Ingestion**: 
   ```bash
   curl -X POST "https://your-app.vercel.app/api/ingest?token=0jzcV7Jt2C6Nmi8PLTAld9uKR1DYZg5Q"
   ```

### Expected Results
- ✅ Homepage should load with job listings
- ✅ Health check should return status: "healthy"
- ✅ Jobs API should return JSON with job data
- ✅ Manual ingestion should start crawling jobs

---

## 🔧 Optional: Advanced Configuration

### Add Telegram Bot (Optional)
1. Create bot with @BotFather on Telegram
2. Get bot token
3. Add to Vercel environment variables:
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `TELEGRAM_WEBHOOK_SECRET`: A secure random string
4. Set webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/telegram/webhook?secret=<SECRET>"
   ```

### Add Discord Webhook (Optional)
1. Create webhook in Discord channel settings
2. Add to Vercel environment variables:
   - `DISCORD_WEBHOOK_URL`: Your Discord webhook URL
3. Test notification:
   ```bash
   curl -X POST "https://your-app.vercel.app/api/subscriptions" \
     -H "Content-Type: application/json" \
     -d '{"type":"discord","identifier":"<WEBHOOK_URL>","topics":"solidity,remote"}'
   ```

### Custom Domain (Optional)
1. In Vercel project settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Automatic request/performance monitoring
- View in Vercel dashboard → Analytics

### Neon Database Monitoring
- View in Neon console → Monitoring
- Monitor database performance and usage

### Cron Jobs
- Automatically configured to run every 3 hours
- Ingests new jobs from RSS feeds and APIs
- Monitor in Vercel dashboard → Functions

---

## 🚨 Troubleshooting

### Build Errors
1. Check Vercel deployment logs
2. Ensure all environment variables are set
3. Verify database connection string format

### Database Issues
1. Check Neon console for connection errors
2. Verify DATABASE_URL format:
   ```
   postgresql://user:pass@host/db?sslmode=require
   ```

### API Errors
1. Check Vercel function logs
2. Verify CRON_SECRET and CRAWL_TOKEN match

### Performance Issues
1. Monitor Vercel analytics
2. Check Neon database metrics
3. Consider upgrading to paid tiers if needed

---

## 💰 Cost Estimation

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 100 functions per month
- **Neon**: 512MB storage, 10M connections

### Scaling Costs
- **Vercel Pro**: $20/month per member
- **Neon Scale**: $19/month for 8GB storage

---

## 🎉 Deployment Complete!

Your Web3 Remote Jobs platform is now:
- ✅ **Live in production** on Vercel
- ✅ **Scalable** with automatic scaling
- ✅ **Secure** with HTTPS and environment variables
- ✅ **Automated** with cron job ingestion
- ✅ **Monitored** with built-in analytics

**Next Steps:**
1. Share your deployment URL
2. Monitor job ingestion (should start automatically)
3. Consider adding notifications (Telegram/Discord)
4. Set up custom domain if needed

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Neon database logs
3. Verify environment variables
4. Test API endpoints manually

**Your deployment URL will be**: `https://web3-remote-jobs-production-[random].vercel.app`