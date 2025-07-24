# 🚨 URGENT: API Version Fix Required

## Problem
The npm package expects `/v1/` prefixed endpoints, but the API doesn't have them.

### Expected by NPM Package:
- `POST /v1/memory` 
- `GET /v1/recall`
- `GET /v1/entities`

### Current API Has:
- `POST /memories`
- `GET /search`
- `GET /entities`

## Quick Fix (Add to server.py)

```python
# Add v1 route aliases right after the existing routes

# V1 API Compatibility Routes
@app.post("/v1/memory", response_model=MemoryResponse)
@limiter.limit("60/minute")
async def create_memory_v1(
    request: Request,
    memory: MemoryCreate,
    api_key: str = Depends(verify_api_key)
):
    """V1 compatibility endpoint"""
    return await create_memory(request, memory, api_key)

@app.get("/v1/recall", response_model=List[MemoryResponse])
@limiter.limit("60/minute")
async def search_memories_v1(
    request: Request,
    query: str = Query(..., description="Search query"),
    search_type: str = Query("hybrid", description="Search type"),
    limit: int = Query(10, ge=1, le=100),
    api_key: str = Depends(verify_api_key)
):
    """V1 compatibility endpoint"""
    return await search_memories(request, query, search_type, limit, api_key)

@app.get("/v1/entities")
@limiter.limit("60/minute")
async def list_entities_v1(
    request: Request,
    entity_type: Optional[str] = Query(None),
    api_key: str = Depends(verify_api_key)
):
    """V1 compatibility endpoint"""
    return await list_entities(request, entity_type, api_key)

# Also add v1 health check
@app.get("/v1/health", response_model=HealthResponse)
async def health_check_v1():
    """V1 compatibility endpoint"""
    return await health_check()
```

## How to Deploy Fix

1. **Edit server.py** in deploy-api folder
2. **Add the v1 routes** (code above)
3. **Redeploy**:
   ```bash
   cd deploy-api
   railway up
   ```

## Result

This will make both URL patterns work:
- ✅ `/memories` (current)
- ✅ `/v1/memory` (npm package)
- ✅ `/search` (current)
- ✅ `/v1/recall` (npm package)

## Time Estimate

- Edit: 5 minutes
- Deploy: 2 minutes
- Test: 3 minutes
- **Total: 10 minutes**

This unblocks all npm users immediately!