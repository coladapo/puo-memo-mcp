# PUO Memo Multi-Tenant Platform Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
- [ ] Set `SUPABASE_SERVICE_KEY` in Railway
- [ ] Set `JWT_SECRET_KEY` (generate with `openssl rand -hex 32`)
- [ ] Update `DB_PASSWORD` with new Supabase password
- [ ] Configure `SENDGRID_API_KEY` for email verification
- [ ] Set up `REDIS_URL` for rate limiting (optional for MVP)

### 2. Database Setup
- [ ] Run migration script: `python scripts/migrate_database.py`
- [ ] Verify tables created: `users`, `api_keys`, `usage_logs`
- [ ] Check RLS policies are active
- [ ] Create test user account
- [ ] Verify memory isolation between users

### 3. Update Railway Deployment
```bash
cd /Users/wivak/puo-jects/active/puo-memo-mcp-client/deploy-api
git add .
git commit -m "Add multi-tenant authentication system"
git push origin main
```

### 4. DNS Configuration
- [ ] Ensure api.puo-memo.com points to Railway app
- [ ] SSL certificate is active
- [ ] Test HTTPS access

## Post-Deployment Testing

### 1. User Registration Flow
```bash
curl -X POST https://api.puo-memo.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

### 2. API Key Testing
```bash
# Test memory creation with API key
curl -X POST https://api.puo-memo.com/v1/memory \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test memory from multi-tenant system",
    "tags": ["test"]
  }'
```

### 3. Memory Isolation Test
- [ ] Create 2 test accounts
- [ ] Store memories in each account
- [ ] Verify memories are isolated
- [ ] Test search returns only user's own memories

### 4. Rate Limiting Test
- [ ] Verify 60 requests/minute limit per API key
- [ ] Test rate limit error response
- [ ] Confirm different API keys have separate limits

### 5. npm Package Integration
```bash
# Install latest npm package
npm install -g puo-memo-mcp@latest

# Test with new API key
PUO_MEMO_API_KEY=test-key npx puo-memo-mcp
```

## Monitoring Setup

### 1. Error Tracking
- [ ] Configure Sentry DSN in production
- [ ] Test error reporting
- [ ] Set up alerts for critical errors

### 2. Usage Analytics
- [ ] Verify usage_logs table is populating
- [ ] Check API response times
- [ ] Monitor memory creation rates

### 3. Database Monitoring
- [ ] Set up Supabase alerts
- [ ] Monitor connection pool usage
- [ ] Track database size growth

## Launch Tasks

### 1. Documentation
- [ ] Update npm package README
- [ ] Create API documentation
- [ ] Write quickstart guide
- [ ] Add troubleshooting section

### 2. Communication
- [ ] Announce on Twitter/X
- [ ] Post on relevant forums
- [ ] Update GitHub repository
- [ ] Email existing users (if any)

### 3. Support Setup
- [ ] Create support email template
- [ ] Set up FAQ page
- [ ] Prepare common issue responses
- [ ] Document rollback procedure

## Rollback Plan

If issues arise:

1. **Quick Fix** (< 5 min downtime)
   - Revert to previous Railway deployment
   - Fix issue in development
   - Re-deploy when ready

2. **Major Issue** (> 5 min downtime)
   - Switch npm package to backup API endpoint
   - Notify users via status page
   - Fix and thoroughly test before re-deployment

## Success Metrics

Week 1 targets:
- [ ] 100+ user signups
- [ ] 10,000+ memories created
- [ ] < 1% error rate
- [ ] < 200ms average response time
- [ ] 99.9% uptime

## Notes

- Keep the original single-tenant code as backup
- Monitor Supabase free tier limits
- Be ready to scale if usage spikes
- Have payment system ready for Pro users

---

**Created**: 2024-01-24
**Last Updated**: 2024-01-24
**Status**: Ready for deployment