# PUO Memo Platform API Deployment

This is the clean deployment package for the PUO Memo Platform API.

## Security Notice

This deployment package has been sanitized of all sensitive credentials. All configuration is done through environment variables.

## Deployment Steps

### 1. Railway Deployment (Recommended)

1. Create a new Railway project:
   ```bash
   railway login
   railway init
   ```

2. Set environment variables:
   ```bash
   railway variables set DB_HOST=<your-db-host>
   railway variables set DB_PORT=5432
   railway variables set DB_NAME=<your-db-name>
   railway variables set DB_USER=<your-db-user>
   railway variables set DB_PASSWORD=<your-db-password>
   railway variables set GEMINI_API_KEY=<your-gemini-key>
   ```

3. Deploy:
   ```bash
   railway up
   ```

4. Get your deployment URL:
   ```bash
   railway domain
   ```

### 2. Docker Deployment

1. Build the image:
   ```bash
   docker build -t puo-memo-api .
   ```

2. Run with environment variables:
   ```bash
   docker run -p 8000:8000 \
     -e DB_HOST=<your-db-host> \
     -e DB_PORT=5432 \
     -e DB_NAME=<your-db-name> \
     -e DB_USER=<your-db-user> \
     -e DB_PASSWORD=<your-db-password> \
     -e GEMINI_API_KEY=<your-gemini-key> \
     puo-memo-api
   ```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
# Edit .env with your values
```

Required variables:
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password

Optional variables:
- `GEMINI_API_KEY`: For AI features
- `RATE_LIMIT_PER_MINUTE`: API rate limiting (default: 60)

## API Endpoints

- `GET /health` - Health check
- `POST /memories` - Create memory
- `GET /search` - Search memories
- `GET /entities` - List entities
- See full API docs at `/docs` when deployed

## Domain Configuration

Configure your domain to point to the Railway deployment:
- Add CNAME record for `api.puo-memo.com` pointing to your Railway domain

## Monitoring

The API includes Prometheus metrics at `/metrics` endpoint.

## Support

For deployment issues, contact: support@puo-memo.com