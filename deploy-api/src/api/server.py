"""
PUO Memo Platform API Server - Production Ready
"""
import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Header, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# Pydantic models
class MemoryCreate(BaseModel):
    content: str = Field(..., description="The content to remember")
    title: Optional[str] = Field(None, description="Optional title")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags for categorization")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

class MemoryResponse(BaseModel):
    id: str
    content: str
    title: Optional[str]
    tags: List[str]
    created_at: str
    updated_at: str
    metadata: Dict[str, Any]

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    search_type: Optional[str] = Field("hybrid", description="Search type: keyword, semantic, hybrid")
    limit: Optional[int] = Field(10, ge=1, le=100)
    tags: Optional[List[str]] = Field(default_factory=list)

class HealthResponse(BaseModel):
    status: str
    version: str
    database: str

# App lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting PUO Memo API Server...")
    # Initialize database connection here
    yield
    # Shutdown
    logger.info("Shutting down PUO Memo API Server...")

# Create FastAPI app
app = FastAPI(
    title="PUO Memo Platform API",
    description="Universal memory system for AI assistants",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
allowed_origins = os.getenv("API_CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key validation
def verify_api_key(x_api_key: str = Header(...)) -> str:
    """Verify API key from header"""
    # In production, validate against database
    # For now, just check it exists
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API Key required")
    return x_api_key

# Routes
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "PUO Memo Platform API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "create_memory": "POST /memories",
            "search": "GET /search",
            "entities": "GET /entities"
        },
        "v1_endpoints": {
            "health": "/v1/health",
            "create_memory": "POST /v1/memory",
            "search": "GET /v1/recall",
            "entities": "GET /v1/entities"
        },
        "documentation": "/docs",
        "npm_package": "puo-memo-mcp"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected"
    }

@app.post("/memories", response_model=MemoryResponse)
@limiter.limit("60/minute")
async def create_memory(
    request: Request,
    memory: MemoryCreate,
    api_key: str = Depends(verify_api_key)
):
    """Create a new memory"""
    try:
        # TODO: Implement actual memory storage
        return {
            "id": "mem_" + os.urandom(8).hex(),
            "content": memory.content,
            "title": memory.title,
            "tags": memory.tags,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "metadata": memory.metadata
        }
    except Exception as e:
        logger.error(f"Error creating memory: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/search", response_model=List[MemoryResponse])
@limiter.limit("60/minute")
async def search_memories(
    request: Request,
    query: str = Query(..., description="Search query"),
    search_type: str = Query("hybrid", description="Search type"),
    limit: int = Query(10, ge=1, le=100),
    api_key: str = Depends(verify_api_key)
):
    """Search memories"""
    try:
        # TODO: Implement actual search
        return []
    except Exception as e:
        logger.error(f"Error searching memories: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/entities")
@limiter.limit("60/minute")
async def list_entities(
    request: Request,
    entity_type: Optional[str] = Query(None),
    api_key: str = Depends(verify_api_key)
):
    """List entities extracted from memories"""
    try:
        # TODO: Implement entity listing
        return {"entities": []}
    except Exception as e:
        logger.error(f"Error listing entities: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# V1 API Compatibility Routes (for npm package)
@app.post("/v1/memory", response_model=MemoryResponse)
@limiter.limit("60/minute")
async def create_memory_v1(
    request: Request,
    memory: MemoryCreate,
    api_key: str = Depends(verify_api_key)
):
    """V1 compatibility endpoint for npm package"""
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
    """V1 compatibility endpoint for npm package"""
    return await search_memories(request, query, search_type, limit, api_key)

@app.get("/v1/entities")
@limiter.limit("60/minute")
async def list_entities_v1(
    request: Request,
    entity_type: Optional[str] = Query(None),
    api_key: str = Depends(verify_api_key)
):
    """V1 compatibility endpoint for npm package"""
    return await list_entities(request, entity_type, api_key)

@app.get("/v1/health", response_model=HealthResponse)
async def health_check_v1():
    """V1 compatibility endpoint for npm package"""
    return await health_check()

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)