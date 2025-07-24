"""
Authentication and user management for PUO Memo Platform
"""
import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from uuid import UUID

from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field, validator
from supabase import create_client, Client
import logging

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# API Key settings
API_KEY_PREFIX = "puo_memo_key_"
API_KEY_LENGTH = 32


class UserCreate(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        """Ensure password meets complexity requirements"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]


class APIKeyCreate(BaseModel):
    """API key creation model"""
    name: str = "Default API Key"
    expires_in_days: Optional[int] = None
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000


class APIKeyResponse(BaseModel):
    """API key response - only shown once!"""
    id: str
    key: str  # Full key, only shown on creation
    name: str
    created_at: datetime
    expires_at: Optional[datetime]
    
    class Config:
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "key": "puo_memo_key_AbCdEfGhIjKlMnOpQrStUvWxYz123456",
                "name": "Production API Key",
                "created_at": "2024-01-01T00:00:00Z",
                "expires_at": None
            }
        }


class AuthManager:
    """Handles user authentication and API key management"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    # Password hashing
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    # JWT token management
    def create_access_token(self, user_id: str, email: str) -> Token:
        """Create a JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user_id,
            "email": email,
            "exp": expire,
            "iat": datetime.utcnow()
        }
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        return Token(
            access_token=encoded_jwt,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={"id": user_id, "email": email}
        )
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise ValueError("Invalid token")
    
    # API key generation
    def generate_api_key(self) -> tuple[str, str]:
        """Generate a new API key and its hash"""
        # Generate a secure random key
        key_bytes = secrets.token_bytes(API_KEY_LENGTH)
        key = API_KEY_PREFIX + key_bytes.hex()
        
        # Hash the key for storage
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        # Extract prefix and suffix for display
        key_suffix = key[-4:]
        
        return key, key_hash, key_suffix
    
    def hash_api_key(self, api_key: str) -> str:
        """Hash an API key for comparison"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    # User management
    async def create_user(self, user_data: UserCreate) -> Dict[str, Any]:
        """Create a new user account"""
        try:
            # Hash the password
            password_hash = self.hash_password(user_data.password)
            
            # Create user in database
            result = await self.supabase.table('users').insert({
                'email': user_data.email,
                'password_hash': password_hash,
                'full_name': user_data.full_name,
                'verification_token': secrets.token_urlsafe(32),
                'verification_sent_at': datetime.now(timezone.utc).isoformat()
            }).execute()
            
            if result.data:
                user = result.data[0]
                # Create default API key
                api_key = await self.create_api_key(user['id'], APIKeyCreate())
                
                # Send verification email (TODO: implement email service)
                # await self.send_verification_email(user['email'], user['verification_token'])
                
                return {
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'full_name': user['full_name']
                    },
                    'api_key': api_key
                }
            else:
                raise ValueError("Failed to create user")
                
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            if "duplicate key" in str(e):
                raise ValueError("Email already registered")
            raise
    
    async def login_user(self, credentials: UserLogin) -> Token:
        """Authenticate user and return JWT token"""
        try:
            # Get user by email
            result = await self.supabase.table('users').select("*").eq(
                'email', credentials.email
            ).execute()
            
            if not result.data:
                raise ValueError("Invalid email or password")
            
            user = result.data[0]
            
            # Verify password
            if not self.verify_password(credentials.password, user['password_hash']):
                raise ValueError("Invalid email or password")
            
            # Check if account is active
            if not user['is_active']:
                raise ValueError("Account is deactivated")
            
            # Update last login
            await self.supabase.table('users').update({
                'last_login_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', user['id']).execute()
            
            # Create JWT token
            return self.create_access_token(user['id'], user['email'])
            
        except Exception as e:
            logger.error(f"Login error: {e}")
            raise
    
    async def create_api_key(self, user_id: str, key_data: APIKeyCreate) -> APIKeyResponse:
        """Create a new API key for a user"""
        try:
            # Generate the key
            api_key, key_hash, key_suffix = self.generate_api_key()
            
            # Calculate expiration
            expires_at = None
            if key_data.expires_in_days:
                expires_at = datetime.now(timezone.utc) + timedelta(days=key_data.expires_in_days)
            
            # Store in database
            result = await self.supabase.table('api_keys').insert({
                'user_id': user_id,
                'key_hash': key_hash,
                'key_prefix': API_KEY_PREFIX,
                'key_suffix': key_suffix,
                'name': key_data.name,
                'expires_at': expires_at.isoformat() if expires_at else None,
                'rate_limit_per_minute': key_data.rate_limit_per_minute,
                'rate_limit_per_hour': key_data.rate_limit_per_hour
            }).execute()
            
            if result.data:
                key_record = result.data[0]
                return APIKeyResponse(
                    id=key_record['id'],
                    key=api_key,  # Full key - only shown once!
                    name=key_record['name'],
                    created_at=key_record['created_at'],
                    expires_at=key_record['expires_at']
                )
            else:
                raise ValueError("Failed to create API key")
                
        except Exception as e:
            logger.error(f"Error creating API key: {e}")
            raise
    
    async def validate_api_key(self, api_key: str) -> Dict[str, Any]:
        """Validate an API key and return user info"""
        try:
            # Hash the provided key
            key_hash = self.hash_api_key(api_key)
            
            # Look up the key
            result = await self.supabase.table('api_keys').select(
                "*, users(*)"
            ).eq('key_hash', key_hash).eq('is_active', True).execute()
            
            if not result.data:
                raise ValueError("Invalid API key")
            
            key_record = result.data[0]
            
            # Check expiration
            if key_record['expires_at']:
                expires_at = datetime.fromisoformat(key_record['expires_at'])
                if expires_at < datetime.now(timezone.utc):
                    raise ValueError("API key expired")
            
            # Update last used
            await self.supabase.table('api_keys').update({
                'last_used_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', key_record['id']).execute()
            
            return {
                'user_id': key_record['user_id'],
                'user': key_record['users'],
                'api_key_id': key_record['id'],
                'rate_limits': {
                    'per_minute': key_record['rate_limit_per_minute'],
                    'per_hour': key_record['rate_limit_per_hour']
                }
            }
            
        except Exception as e:
            logger.error(f"API key validation error: {e}")
            raise
    
    async def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """Get user by ID"""
        result = await self.supabase.table('users').select("*").eq('id', user_id).execute()
        if result.data:
            return result.data[0]
        return None