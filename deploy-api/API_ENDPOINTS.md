# PUO Memo API Endpoints

Base URL: `https://api.puo-memo.com`

## Authentication

All endpoints require API key authentication:
```
X-API-Key: your-api-key-here
```

## Endpoints

### Health Check
```
GET /health
```
No authentication required. Returns:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```

### Create Memory
```
POST /memories
```
Request body:
```json
{
  "content": "The content to remember",
  "title": "Optional title",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "custom": "data"
  }
}
```

Response:
```json
{
  "id": "mem_1234567890abcdef",
  "content": "The content to remember",
  "title": "Optional title",
  "tags": ["tag1", "tag2"],
  "created_at": "2025-01-24T12:00:00Z",
  "updated_at": "2025-01-24T12:00:00Z",
  "metadata": {
    "custom": "data"
  }
}
```

### Search Memories
```
GET /search?query=your+search&search_type=hybrid&limit=10
```

Query parameters:
- `query` (required): Search query
- `search_type` (optional): `keyword`, `semantic`, or `hybrid` (default)
- `limit` (optional): 1-100 (default: 10)

Response:
```json
[
  {
    "id": "mem_1234567890abcdef",
    "content": "Matching content",
    "title": "Title",
    "tags": ["tag1"],
    "created_at": "2025-01-24T12:00:00Z",
    "updated_at": "2025-01-24T12:00:00Z",
    "metadata": {}
  }
]
```

### List Entities
```
GET /entities?entity_type=person
```

Query parameters:
- `entity_type` (optional): Filter by type

Response:
```json
{
  "entities": [
    {
      "name": "John Doe",
      "type": "person",
      "mention_count": 5
    }
  ]
}
```

## Rate Limits

- 60 requests per minute per API key
- 429 status code when exceeded
- Retry-After header indicates wait time

## Error Responses

```json
{
  "detail": "Error message"
}
```

Status codes:
- 400: Bad Request
- 401: Unauthorized (invalid API key)
- 429: Rate Limited
- 500: Server Error

## Demo API Keys

For testing:
- `demo-key-123`: Limited to 10 requests/hour
- Contact support@puo-memo.com for production keys