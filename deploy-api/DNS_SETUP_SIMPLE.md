# 🌐 DNS Setup - Make api.puo-memo.com Work

## Who is your domain provider?

### 🔵 Cloudflare (Most Common)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click on `puo-memo.com`
3. Click "DNS" on the left
4. Click "Add record"
5. Fill in:
   - Type: `CNAME`
   - Name: `api`
   - Target: `puo-memo-production.up.railway.app`
   - Proxy status: ON (orange cloud)
6. Click "Save"

### 🟢 Namecheap
1. Go to [namecheap.com](https://namecheap.com)
2. Sign in → Domain List → Manage (next to puo-memo.com)
3. Click "Advanced DNS"
4. Click "Add New Record"
5. Fill in:
   - Type: `CNAME Record`
   - Host: `api`
   - Value: `puo-memo-production.up.railway.app`
   - TTL: Automatic
6. Click the checkmark to save

### 🟣 GoDaddy
1. Go to [godaddy.com](https://godaddy.com)
2. Sign in → My Products → DNS (next to puo-memo.com)
3. Click "Add"
4. Fill in:
   - Type: `CNAME`
   - Name: `api`
   - Value: `puo-memo-production.up.railway.app`
   - TTL: 1 hour
5. Click "Save"

### 🟠 Google Domains / Squarespace
1. Go to [domains.google.com](https://domains.google.com)
2. Click on `puo-memo.com`
3. Click "DNS" on the left
4. Scroll to "Custom records"
5. Fill in:
   - Host name: `api`
   - Type: `CNAME`
   - Data: `puo-memo-production.up.railway.app`
   - TTL: 1 hour
6. Click "Add"

## ⏱️ How long will it take?

- **Cloudflare**: 1-5 minutes
- **Others**: 5-30 minutes
- **Maximum**: 48 hours (very rare)

## 🧪 Test if it's working

After adding the DNS record, test it:

```bash
# Check if DNS is set
dig api.puo-memo.com

# Test the API (may take a few minutes)
curl https://api.puo-memo.com/health
```

## 🚨 Common Issues

1. **"Site can't be reached"** - DNS hasn't propagated yet, wait 5-10 minutes
2. **SSL error** - Normal at first, Railway will auto-generate SSL certificate
3. **Wrong record type** - Make sure it's CNAME, not A record

## 📱 While You Wait

The API is already working at:
https://puo-memo-production.up.railway.app

So the npm package can use this URL temporarily if needed!