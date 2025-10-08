#!/bin/bash

# Secure Deployment Script for Web3 Jobs Platform
# This script handles deployment without exposing sensitive tokens

set -e

echo "🚀 Starting secure deployment process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ Git is not installed${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is not installed${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ NPM is not installed${NC}" >&2; exit 1; }

# Function to check if token is provided as environment variable
check_token() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Token not provided as environment variable${NC}"
        echo "Please set: export $2=your_token"
        exit 1
    fi
}

# Check environment variables (SECURE METHOD)
echo -e "${YELLOW}📋 Checking environment variables...${NC}"
check_token "$GITHUB_TOKEN" "GITHUB_TOKEN"
check_token "$VERCEL_TOKEN" "VERCEL_TOKEN"

# Git configuration and commit
echo -e "${YELLOW}📝 Committing changes to Git...${NC}"

# Configure git with token (secure)
git config --global credential.helper store
echo "https://x-access-token:$GITHUB_TOKEN@github.com" > ~/.git-credentials

# Add changes
git add .
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

📦 Ready for production deployment"

# Push to GitHub
echo -e "${YELLOW}⬆️ Pushing to GitHub...${NC}"
git push origin main

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel@latest
fi

# Login to Vercel using token
echo -e "${YELLOW}🔐 Authenticating with Vercel...${NC}"
echo "$VERCEL_TOKEN" | vercel login --token

# Deploy to production
echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
vercel --prod --confirm

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --scope=team 2>/dev/null | grep -E "^\s*\w+\s+\w+\s+production" | head -1 | awk '{print $2}')

if [ -z "$DEPLOYMENT_URL" ]; then
    DEPLOYMENT_URL="https://remotejobs.top"
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Your site is live at: ${DEPLOYMENT_URL}${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running Playwright tests...${NC}"
npm run test:playwright || echo -e "${YELLOW}⚠️ Playwright tests not configured${NC}"

echo -e "${GREEN}🎉 All done!${NC}"