#!/bin/bash
# Quick Railway Deployment Commands
# Copy and paste these one by one

echo "📦 Step 1: Navigate to deployment directory"
echo "Run this:"
echo "cd /Users/wivak/puo-jects/active/puo-memo-mcp-client/deploy-api"
echo ""

echo "🔗 Step 2: Link to your Railway project"
echo "Run this:"
echo "railway link -p ed153ab4-9958-4121-ba14-1804cf84675a"
echo ""

echo "🚀 Step 3: Deploy your API"
echo "Run this:"
echo "railway up"
echo ""

echo "⚙️ Step 4: Set all environment variables at once"
echo "Run this (all one command):"
cat << 'EOF'
railway variables set \
  DB_HOST="aws-0-us-west-1.pooler.supabase.com" \
  DB_PORT="6543" \
  DB_NAME="postgres" \
  DB_USER="postgres.bcmsutoahlxqriealrjb" \
  DB_PASSWORD="qJljzU3K0Yvzp5oZ" \
  API_CORS_ORIGINS="*" \
  ENABLE_METRICS="true"
EOF
echo ""

echo "🌐 Step 5: Get your deployment URL"
echo "Run this:"
echo "railway domain"
echo ""

echo "✅ Step 6: Test your API"
echo "Run this (replace YOUR_URL with the URL from step 5):"
echo 'curl https://YOUR_URL.railway.app/health'