#!/bin/bash
# PUO Memo API Deployment Script

echo "🚀 Deploying PUO Memo Platform API..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null
then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "brew install railway"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null
then
    echo "🔐 Please log in to Railway first..."
    railway login
fi

echo "📦 Creating new Railway project..."
railway init

echo "⚙️ Setting environment variables..."
echo "Please provide the following configuration:"

read -p "Database Host: " DB_HOST
read -p "Database Port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "Database Name: " DB_NAME
read -p "Database User: " DB_USER
read -s -p "Database Password: " DB_PASSWORD
echo
read -p "Gemini API Key (optional): " GEMINI_API_KEY

# Set environment variables
railway variables set DB_HOST="$DB_HOST"
railway variables set DB_PORT="$DB_PORT"
railway variables set DB_NAME="$DB_NAME"
railway variables set DB_USER="$DB_USER"
railway variables set DB_PASSWORD="$DB_PASSWORD"

if [ ! -z "$GEMINI_API_KEY" ]; then
    railway variables set GEMINI_API_KEY="$GEMINI_API_KEY"
fi

# Set additional config
railway variables set API_CORS_ORIGINS="https://puo-memo.com,https://api.puo-memo.com"
railway variables set ENABLE_METRICS="true"

echo "🚂 Deploying to Railway..."
railway up

echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure your domain to point to the Railway URL"
echo "2. Test the API: curl https://your-domain.railway.app/health"
echo "3. Update the MCP client to use the production API"