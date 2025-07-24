# 🚂 Railway Deployment Guide (From Scratch)

## 1. Create Railway Account (Free)

1. **Sign up at [railway.app](https://railway.app)**
   - Click "Start New Project"
   - Sign up with GitHub (recommended) or email
   - No credit card required for free tier

## 2. Install Railway CLI

```bash
# macOS (using Homebrew)
brew install railway

# Or download from
# https://docs.railway.app/develop/cli#installation
```

## 3. Deploy Your API

```bash
# Navigate to deployment directory
cd /Users/wivak/puo-jects/active/puo-memo-mcp-client/deploy-api

# Login to Railway
railway login

# Initialize new project
railway init

# When prompted:
# - Enter project name: puo-memo-api
# - Select "Empty Project"
```

## 4. Set Environment Variables

```bash
# Set your Supabase connection details
railway variables set DB_HOST="aws-0-us-west-1.pooler.supabase.com"
railway variables set DB_PORT="6543"
railway variables set DB_NAME="postgres"
railway variables set DB_USER="postgres.bcmsutoahlxqriealrjb"
railway variables set DB_PASSWORD="qJljzU3K0Yvzp5oZ"

# Set API configuration
railway variables set API_CORS_ORIGINS="*"
railway variables set ENABLE_METRICS="true"

# Optional: Gemini API (you should regenerate this key!)
railway variables set GEMINI_API_KEY="your-new-gemini-key"
```

## 5. Deploy the API

```bash
# Deploy to Railway
railway up

# This will:
# - Upload your code
# - Detect Python app
# - Install dependencies
# - Start the FastAPI server
```

## 6. Get Your URL

```bash
# Generate a public URL
railway domain

# You'll get something like:
# puo-memo-api-production.up.railway.app
```

## 7. Test Your Deployment

```bash
# Test health endpoint
curl https://your-app.up.railway.app/health

# Test with demo key
curl -H "X-API-Key: demo-puo-memo-2025" \
     https://your-app.up.railway.app/search?query=test
```

## 8. Configure DNS (After Deployment)

Once you have your Railway URL:

1. Go to your domain provider (Cloudflare, Namecheap, etc.)
2. Add CNAME record:
   - Host: `api`
   - Target: `your-app.up.railway.app`
   - TTL: 300

## Free Tier Limits

Railway's free tier includes:
- $5/month free credits
- 500 hours of runtime
- 100GB bandwidth
- Perfect for getting started!

## Quick Deploy Script

I've created a simpler version:

```bash
#!/bin/bash
# Simple Railway deployment

echo "🚂 Deploying to Railway..."

# Login if needed
railway login

# Create project
railway init

# Deploy
railway up

# Get URL
echo "🌐 Your API URL:"
railway domain
```

## Troubleshooting

If deployment fails:
1. Check logs: `railway logs`
2. Verify Python version in runtime.txt
3. Ensure all files are in place
4. Check environment variables

## Next Steps

After deployment:
1. Update DNS to point api.puo-memo.com to Railway URL
2. Test the npm package can connect
3. Monitor logs for any issues
4. Celebrate! 🎉

The API will be live in about 2-3 minutes after deployment!