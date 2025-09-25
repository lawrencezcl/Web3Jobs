#!/bin/bash

# Test script for Web3 Jobs Telegram channel posting
# This script tests the job collection and posting functionality

echo "🚀 Testing Web3 Jobs Telegram Channel Posting"
echo "============================================"

# Base URL
BASE_URL="https://web3-jobs-l15280ijg-lawrencezcls-projects.vercel.app"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local headers=$4

    echo -e "${YELLOW}Testing $method $endpoint${NC}"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" -H "Content-Type: application/json" $headers "$BASE_URL$endpoint" -d "$data")
    fi

    http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
    body=$(echo "$response" | sed -e 's/HTTP_CODE:[0-9]*$//')

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Success ($http_code)${NC}"
        echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
    else
        echo -e "${RED}❌ Failed ($http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

# 1. Test cron job (GET /api/cron)
echo "1. Testing cron job endpoint..."
test_endpoint "/api/cron" "GET" ""

# 2. Test job ingestion (POST /api/ingest-job)
echo "2. Testing job ingestion endpoint..."
test_endpoint "/api/ingest-job" "POST" '{
    "title": "Senior Blockchain Developer",
    "company": "Test Crypto Company",
    "description": "Looking for an experienced blockchain developer with Solidity and smart contract expertise.",
    "location": "Remote",
    "remote": true,
    "salary": "$120k - $180k",
    "employmentType": "Full-time",
    "url": "https://example.com/job",
    "tags": ["blockchain", "solidity", "web3"]
}' "-H 'X-API-Key: web3jobs-ingestion-secret'"

# 3. Test job posting to channel (POST /api/post-job-to-channel)
echo "3. Testing job posting to channel..."
test_endpoint "/api/post-job-to-channel" "POST" '{
    "id": "test_123",
    "title": "Smart Contract Developer",
    "company": "DeFi Labs",
    "location": "Remote",
    "remote": true,
    "salary": "$140k - $200k",
    "employmentType": "Full-time",
    "postedAt": "'$(date -Iseconds)'",
    "url": "https://example.com/job2",
    "applyUrl": "https://example.com/apply",
    "tags": ["smart-contracts", "defi", "solidity"],
    "description": "Experienced smart contract developer needed for DeFi protocol development."
}' "-H 'Authorization: Bearer web3jobs-posting-secret'"

# 4. Test admin interface accessibility
echo "4. Testing admin interface..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Admin interface accessible${NC}"
else
    echo -e "${RED}❌ Admin interface not accessible ($response)${NC}"
fi

echo ""
echo "🎯 Test Summary:"
echo "- Cron job: Collects jobs from multiple sources"
echo "- Ingestion: Filters and posts Web3 jobs to channel"
echo "- Admin interface: Manual job posting interface"
echo "- All endpoints should be working after deployment"
echo ""
echo "📱 To test manually:"
echo "1. Visit: $BASE_URL/admin"
echo "2. Use Telegram commands: /postjob or /ingest"
echo "3. Check @web3jobs88 channel for posted jobs"