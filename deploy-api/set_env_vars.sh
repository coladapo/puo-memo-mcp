#!/bin/bash
# Set Railway environment variables

echo "🔧 Setting environment variables..."

# Set each variable
railway variables --set "DB_HOST=aws-0-us-west-1.pooler.supabase.com"
railway variables --set "DB_PORT=6543"
railway variables --set "DB_NAME=postgres"
railway variables --set "DB_USER=postgres.bcmsutoahlxqriealrjb"
railway variables --set "DB_PASSWORD=qJljzU3K0Yvzp5oZ"
railway variables --set "API_CORS_ORIGINS=*"

echo "✅ Environment variables set!"
echo ""
echo "🚀 Now redeploy to apply changes:"
echo "railway up"