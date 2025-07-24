# 🔐 Update Deployment with New Password

## Quick Update Steps

### 1. Update Railway Environment Variables

```bash
cd deploy-api

# Set the new database password
railway variables set DB_PASSWORD="your-new-password-here"

# Verify it was set
railway variables

# Redeploy to apply changes
railway up
```

### 2. Update Local Testing

Create a `.env` file in deploy-api/ for local testing:

```bash
# Copy the example
cp .env.example .env

# Edit .env with your new password
# DB_PASSWORD=your-new-password-here
```

### 3. Test the Connection

```bash
# Test with the API test script
python test_api.py http://localhost:8000

# Or test database directly
python -c "
import asyncpg
import asyncio

async def test():
    try:
        conn = await asyncpg.connect(
            host='your-supabase-host',
            port=5432,
            user='postgres',
            password='your-new-password',
            database='postgres'
        )
        print('✅ Connection successful!')
        await conn.close()
    except Exception as e:
        print(f'❌ Connection failed: {e}')

asyncio.run(test())
"
```

### 4. Quick Railway Deployment

If you haven't deployed yet:

```bash
# Initialize Railway project
railway login
railway init

# Link to existing project or create new
railway link

# Set all environment variables
railway variables set DB_HOST="your-supabase-host"
railway variables set DB_PORT="5432"
railway variables set DB_NAME="postgres"
railway variables set DB_USER="postgres"
railway variables set DB_PASSWORD="your-new-password"
railway variables set API_CORS_ORIGINS="https://puo-memo.com,https://api.puo-memo.com"

# Deploy
railway up

# Get your deployment URL
railway domain
```

### 5. Update Any Other Services

Check and update password in:
- [ ] Any local development environments
- [ ] CI/CD pipelines
- [ ] Other connected services
- [ ] Backup scripts
- [ ] Monitoring tools

## 🚨 Security Checklist

- [x] Supabase password changed
- [ ] Railway environment updated
- [ ] Local .env files updated
- [ ] Old password removed from all configs
- [ ] Test new connection works
- [ ] Deploy API with new password

## Need Help?

If connection fails after password change:
1. Double-check password has no special characters that need escaping
2. Verify Supabase connection string format
3. Check Railway logs: `railway logs`
4. Ensure database is not paused in Supabase

Ready to deploy with the new secure password! 🚀