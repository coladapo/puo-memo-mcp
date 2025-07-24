# DNS Configuration for api.puo-memo.com

## Quick Setup Guide

### 1. Railway Deployment URL

After deploying to Railway, you'll get a URL like:
```
puo-memo-api-production.up.railway.app
```

### 2. DNS Configuration

Add these records to your domain DNS:

#### Option A: CNAME Record (Recommended)
```
Type: CNAME
Host: api
Target: puo-memo-api-production.up.railway.app
TTL: 300
```

#### Option B: A Record (if CNAME not available)
```
Type: A
Host: api
IP: [Railway provides this]
TTL: 300
```

### 3. Common DNS Providers

#### Cloudflare
1. Log in to Cloudflare
2. Select your domain
3. Go to DNS settings
4. Add CNAME record
5. Enable proxy (orange cloud) for DDoS protection

#### Namecheap
1. Domain List → Manage
2. Advanced DNS
3. Add New Record → CNAME
4. Host: api
5. Target: your-railway-url

#### GoDaddy
1. My Products → DNS
2. Add → CNAME
3. Name: api
4. Value: your-railway-url

### 4. Verify DNS

```bash
# Check DNS propagation
dig api.puo-memo.com

# Test the endpoint
curl https://api.puo-memo.com/health
```

### 5. SSL/TLS

Railway provides automatic SSL certificates. No additional configuration needed.

### 6. Propagation Time

DNS changes typically take:
- 5-10 minutes with Cloudflare
- 15-30 minutes with most providers
- Up to 48 hours globally (rare)

### 7. Troubleshooting

If api.puo-memo.com doesn't work:
1. Check Railway deployment is live
2. Verify DNS records are correct
3. Clear local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```
4. Try from different network/device
5. Use online DNS checker tools

### 8. Alternative Subdomains

If 'api' is taken, alternatives:
- platform.puo-memo.com
- backend.puo-memo.com
- services.puo-memo.com
- v1.puo-memo.com