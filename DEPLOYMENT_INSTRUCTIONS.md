# 🚀 Production Deployment Guide

## 🔐 Security First - Do NOT Expose Tokens

For security reasons, never expose your tokens in scripts or commit them to Git. Use environment variables instead.

## Step 1: Git Configuration

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Ubuntu: sudo apt install gh

# Login with your token
echo "YOUR_GITHUB_TOKEN" | gh auth login --with-token

# Verify authentication
gh auth status
```

### Option B: Configure Git with Token
```bash
# Set up git credential helper
git config --global credential.helper store

# Set remote URL with token (replace YOUR_USERNAME and YOUR_REPO)
git remote set-url origin https://YOUR_GITHUB_TOKEN@github.com/yourusername/yourrepo.git
```

## Step 2: Commit and Push Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add comprehensive Web3 jobs platform enhancements

✨ New Features:
- Job alert system with email notifications
- Company profiles with verification badges
- Advanced search and filtering capabilities
- Saved jobs functionality with local storage
- PWA support with offline capabilities
- Salary insights and analytics dashboard
- User authentication and profiles
- Mobile-optimized UI/UX

🔧 Technical Improvements:
- Fixed SEO domain references to remotejobs.top
- Enhanced performance with lazy loading
- Improved error handling and validation
- Added comprehensive test coverage
- Integrated Playwright E2E testing

📦 Ready for production deployment"

# Push to GitHub
git push origin main
```

## Step 3: Vercel Deployment

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login with token
echo "YOUR_VERCEL_TOKEN" | vercel login --token

# Link project (if not already linked)
vercel link

# Deploy to production
vercel --prod
```

### Option B: Using GitHub Integration (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `.next`

5. Add Environment Variables in Vercel Dashboard:
   ```
   DATABASE_URL=your_neon_database_url
   CRAWL_TOKEN=your_crawl_token
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
   JOB_POSTING_TOKEN=your_job_posting_token
   INGESTION_TOKEN=your_ingestion_token
   ADMIN_USER_IDS=your_admin_user_ids
   ```

6. Deploy!
   - Vercel will automatically deploy on push to main branch

## Step 4: Configure Environment Variables

### Required Environment Variables
Create a `.env` file locally (never commit this file):

```env
# Database
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Security
CRAWL_TOKEN="generate-strong-random-string"
NEXTAUTH_SECRET="generate-another-strong-string"
NEXTAUTH_URL="https://remotejobs.top"

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456:ABCDEF..."
TELEGRAM_WEBHOOK_SECRET="webhook-secret"

# Channel Posting
JOB_POSTING_TOKEN="job-posting-secret"
INGESTION_TOKEN="ingestion-secret"
ADMIN_USER_IDS="your-telegram-user-id"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@remotejobs.top"

# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
VERCEL_ANALYTICS_ID="your-vercel-analytics-id"
```

## Step 5: Deploy with Secure Script

Use the provided secure deployment script:

```bash
# Make script executable
chmod +x scripts/deploy-secure.sh

# Set environment variables
export GITHUB_TOKEN="your_github_token"
export VERCEL_TOKEN="your_vercel_token"
export PRODUCTION_URL="https://remotejobs.top"

# Run deployment
./scripts/deploy-secure.sh
```

## Step 6: Run Playwright Tests

### Install Browsers (First Time Only)
```bash
npx playwright install
npx playwright install-deps
```

### Run Tests Against Production
```bash
# Test production site
PRODUCTION_URL="https://remotejobs.top" npm run test:e2e:prod

# Test with all browsers
npm run test:playwright

# View test report
npm run test:playwright:report
```

### Test Specific Features
```bash
# Test only critical functionality
npx playwright test --grep "Homepage loads|Search functionality|Navigation"

# Run tests in UI mode
npm run test:playwright:ui
```

## Step 7: Post-Deployment Checklist

### ✅ Verify Deployment
1. Check that the site loads at https://remotejobs.top
2. Verify all pages work correctly
3. Test search and filtering
4. Check mobile responsiveness
5. Verify API endpoints

### ✅ SEO Verification
1. Check page titles and meta descriptions
2. Verify canonical URLs
3. Test structured data with [Rich Results Test](https://search.google.com/test/rich-results)
4. Submit sitemap to Google Search Console

### ✅ Performance Checks
1. Run [Lighthouse audit](https://pagespeed.web.dev/)
2. Check Core Web Vitals
3. Verify image optimization
4. Test loading speed

### ✅ Monitoring Setup
1. Check Vercel Analytics
2. Set up error tracking (Sentry)
3. Configure uptime monitoring
4. Set up alerts for errors

## Step 8: Telegram Bot Setup

### Set Webhook
```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://remotejobs.top/api/telegram/webhook?secret=<TELEGRAM_WEBHOOK_SECRET>"
```

### Verify Webhook
```bash
curl "https://remotejobs.top/api/telegram/debug"
```

## Step 9: Cron Job Configuration

Vercel automatically sets up the cron job based on `vercel.json`. Verify it's running:

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. Check that `/api/cron` is scheduled
3. Verify logs for successful runs

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check for missing environment variables
   - Verify `prisma generate` runs successfully
   - Check TypeScript errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check Neon PostgreSQL status
   - Ensure SSL is enabled

3. **Telegram Bot Not Working**
   - Verify webhook URL is correct
   - Check bot token is valid
   - Ensure webhook secret matches

4. **Tests Fail**
   - Update PRODUCTION_URL environment variable
   - Check if site is accessible
   - Verify test selectors match current UI

### Get Help

- Check Vercel logs in dashboard
- Review GitHub Actions if configured
- Test API endpoints individually
- Run tests locally first

## Security Reminders

- 🔒 Never commit tokens to Git
- 🔒 Use environment variables for all secrets
- 🔒 Rotate tokens regularly
- 🔒 Use HTTPS everywhere
- 🔒 Enable security headers
- 🔒 Monitor for suspicious activity

## Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Configure backup strategies
3. Plan scaling strategies
4. Add more test coverage
5. Set up CI/CD pipeline
6. Document API endpoints
7. Create user guides
8. Plan feature roadmap

---

🎉 **Congratulations! Your Web3 Jobs Platform is now live!**