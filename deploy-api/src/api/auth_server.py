"""
PUO Memo Platform API with Multi-tenant Authentication
"""
import os
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Header, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn

from src.core.auth import (
    AuthManager, UserCreate, UserLogin, Token, 
    APIKeyCreate, APIKeyResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize auth manager
auth_manager = AuthManager(
    supabase_url=os.getenv("SUPABASE_URL", "https://bcmsutoahlxqriealrjb.supabase.co"),
    supabase_key=os.getenv("SUPABASE_SERVICE_KEY", "")  # Use service key for admin operations
)

# Security schemes
security = HTTPBearer()

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# Pydantic models
class MemoryCreate(BaseModel):
    content: str = Field(..., description="The content to remember")
    title: Optional[str] = Field(None, description="Optional title")
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class MemoryResponse(BaseModel):
    id: str
    user_id: str
    content: str
    title: Optional[str]
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    subscription_tier: str
    memory_count: int
    monthly_memory_count: int
    created_at: datetime

# Dependency to get current user from JWT token
async def get_current_user_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = auth_manager.decode_token(token)
        user = await auth_manager.get_user_by_id(payload['sub'])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception as e:
        logger.error(f"JWT validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Dependency to get current user from API key
async def get_current_user_api_key(x_api_key: str = Header(...)) -> Dict[str, Any]:
    """Get current user from API key"""
    try:
        auth_info = await auth_manager.validate_api_key(x_api_key)
        return auth_info
    except Exception as e:
        logger.error(f"API key validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid API key")

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    logger.info("🚀 Starting PUO Memo Platform API...")
    yield
    logger.info("👋 Shutting down PUO Memo Platform API...")

# Create FastAPI app
app = FastAPI(
    title="PUO Memo Platform API",
    description="Multi-tenant memory management platform with authentication",
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "PUO Memo Platform API",
        "version": "2.0.0",
        "status": "operational",
        "features": ["multi-tenant", "authentication", "rate-limiting"],
        "documentation": "/docs",
        "signup": "POST /auth/register",
        "npm_package": "puo-memo-mcp"
    }

# Authentication endpoints
@app.post("/auth/register", response_model=Dict[str, Any])
@limiter.limit("5/hour")
async def register(request: Request, user_data: UserCreate):
    """Register a new user account"""
    try:
        result = await auth_manager.create_user(user_data)
        return {
            "message": "User created successfully. Please check your email for verification.",
            "user": result['user'],
            "api_key": result['api_key'].dict()
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/auth/login", response_model=Token)
@limiter.limit("10/hour")
async def login(request: Request, credentials: UserLogin):
    """Login with email and password"""
    try:
        token = await auth_manager.login_user(credentials)
        return token
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user(user: Dict[str, Any] = Depends(get_current_user_jwt)):
    """Get current user profile"""
    return UserResponse(
        id=user['id'],
        email=user['email'],
        full_name=user['full_name'],
        subscription_tier=user['subscription_tier'],
        memory_count=user['memory_count'],
        monthly_memory_count=user['monthly_memory_count'],
        created_at=user['created_at']
    )

# API Key management endpoints
@app.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(
    key_data: APIKeyCreate,
    user: Dict[str, Any] = Depends(get_current_user_jwt)
):
    """Create a new API key"""
    try:
        api_key = await auth_manager.create_api_key(user['id'], key_data)
        return api_key
    except Exception as e:
        logger.error(f"API key creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create API key")

@app.get("/api-keys", response_model=List[Dict[str, Any]])
async def list_api_keys(user: Dict[str, Any] = Depends(get_current_user_jwt)):
    """List user's API keys (without revealing the actual keys)"""
    try:
        # Get API keys from database
        result = await auth_manager.supabase.table('api_keys').select(
            "id, name, key_prefix, key_suffix, created_at, expires_at, last_used_at, is_active"
        ).eq('user_id', user['id']).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        raise HTTPException(status_code=500, detail="Failed to list API keys")

# Memory management endpoints (now user-aware)
@app.post("/memories", response_model=MemoryResponse)
@limiter.limit("60/minute")
async def create_memory(
    request: Request,
    memory: MemoryCreate,
    auth_info: Dict[str, Any] = Depends(get_current_user_api_key)
):
    """Create a new memory for the authenticated user"""
    try:
        user_id = auth_info['user_id']
        
        # Set user context for RLS
        await auth_manager.supabase.rpc('set_current_user_id', {'user_id': user_id}).execute()
        
        # Create memory with user_id
        memory_id = os.urandom(8).hex()
        result = await auth_manager.supabase.table('memory_entities').insert({
            'id': f"mem_{memory_id}",
            'user_id': user_id,
            'content': memory.content,
            'title': memory.title or memory.content[:100],
            'tags': memory.tags,
            'metadata': memory.metadata,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }).execute()
        
        if result.data:
            return MemoryResponse(**result.data[0])
        else:
            raise ValueError("Failed to create memory")
            
    except Exception as e:
        logger.error(f"Error creating memory: {e}")
        if "Monthly memory limit exceeded" in str(e):
            raise HTTPException(status_code=429, detail=str(e))
        raise HTTPException(status_code=500, detail="Failed to create memory")

@app.get("/search", response_model=List[MemoryResponse])
@limiter.limit("60/minute")
async def search_memories(
    request: Request,
    query: str,
    limit: int = 10,
    auth_info: Dict[str, Any] = Depends(get_current_user_api_key)
):
    """Search user's memories"""
    try:
        user_id = auth_info['user_id']
        
        # Set user context for RLS
        await auth_manager.supabase.rpc('set_current_user_id', {'user_id': user_id}).execute()
        
        # Search memories (RLS will automatically filter by user)
        result = await auth_manager.supabase.table('memory_entities').select("*").ilike(
            'content', f'%{query}%'
        ).limit(limit).execute()
        
        return [MemoryResponse(**mem) for mem in result.data]
        
    except Exception as e:
        logger.error(f"Error searching memories: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

# V1 API Compatibility Routes (for npm package)
@app.post("/v1/memory", response_model=MemoryResponse)
@limiter.limit("60/minute")
async def create_memory_v1(
    request: Request,
    memory: MemoryCreate,
    auth_info: Dict[str, Any] = Depends(get_current_user_api_key)
):
    """V1 compatibility endpoint for npm package"""
    return await create_memory(request, memory, auth_info)

@app.get("/v1/recall", response_model=List[MemoryResponse])
@limiter.limit("60/minute")
async def search_memories_v1(
    request: Request,
    query: str,
    limit: int = 10,
    auth_info: Dict[str, Any] = Depends(get_current_user_api_key)
):
    """V1 compatibility endpoint for npm package"""
    return await search_memories(request, query, limit, auth_info)

# Usage tracking
@app.middleware("http")
async def track_usage(request: Request, call_next):
    """Track API usage for billing and analytics"""
    start_time = datetime.utcnow()
    
    # Process request
    response = await call_next(request)
    
    # Calculate response time
    response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
    
    # Log usage if authenticated endpoint
    if hasattr(request.state, "user_id"):
        try:
            await auth_manager.supabase.table('usage_logs').insert({
                'user_id': request.state.user_id,
                'endpoint': str(request.url.path),
                'method': request.method,
                'status_code': response.status_code,
                'response_time_ms': int(response_time),
                'ip_address': get_remote_address(request),
                'user_agent': request.headers.get('user-agent', '')
            }).execute()
        except Exception as e:
            logger.error(f"Failed to log usage: {e}")
    
    return response

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)