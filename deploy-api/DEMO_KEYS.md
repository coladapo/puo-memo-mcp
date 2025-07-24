# Demo API Keys for PUO Memo

## Public Demo Keys

These keys are for testing and demonstration purposes:

### 1. Basic Demo Key
```
API Key: demo-puo-memo-2025
Rate Limit: 10 requests/hour
Features: Basic memory storage and search
```

### 2. Developer Test Key
```
API Key: test-dev-puo-memo-xyz
Rate Limit: 60 requests/hour
Features: Full API access for testing
```

### 3. Documentation Examples Key
```
API Key: docs-example-key-123
Rate Limit: 5 requests/hour
Features: For use in documentation examples only
```

## Usage Example

```bash
# Test with curl
curl -H "X-API-Key: demo-puo-memo-2025" \
     https://api.puo-memo.com/health

# Create a memory
curl -X POST \
     -H "X-API-Key: test-dev-puo-memo-xyz" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test memory from demo"}' \
     https://api.puo-memo.com/memories
```

## In MCP Configuration

```json
{
  "mcpServers": {
    "puo-memo": {
      "command": "npx",
      "args": ["puo-memo-mcp"],
      "env": {
        "PUO_MEMO_API_KEY": "demo-puo-memo-2025"
      }
    }
  }
}
```

## Limitations

- Demo keys are rate-limited
- Data may be cleared periodically
- Not for production use
- No SLA guarantees

## Get Production Keys

Sign up at https://puo-memo.com for:
- Higher rate limits
- Persistent storage
- Priority support
- Advanced features