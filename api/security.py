"""
Security and authentication module.

Handles JWT token generation, validation, password hashing, and user authentication.
"""

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.authentication import AuthenticationError
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# Configuration
# ============================================================================

# Security settings
SECRET_KEY = os.getenv("API_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer scheme
security = HTTPBearer()


# ============================================================================
# Password Management
# ============================================================================

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============================================================================
# JWT Token Management
# ============================================================================

def create_access_token(
    user_id: str,
    data: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        user_id: User identifier
        data: Additional data to encode in token
        expires_delta: Token expiration time delta

    Returns:
        Encoded JWT token
    """
    to_encode = {"sub": user_id}

    if data:
        to_encode.update(data)

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: str) -> str:
    """
    Create a JWT refresh token.

    Args:
        user_id: User identifier

    Returns:
        Encoded JWT refresh token
    """
    return create_access_token(
        user_id,
        data={"type": "refresh"},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token to verify

    Returns:
        Decoded token payload

    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise JWTError("Invalid token: missing user ID")

        return payload

    except JWTError as e:
        logger.error(f"Token verification failed: {e}")
        raise


def get_token_from_header(credentials: Any) -> str:
    """
    Extract token from HTTP Bearer authentication header.

    Args:
        credentials: HTTP authentication credentials

    Returns:
        JWT token string
    """
    return credentials.credentials


# ============================================================================
# Dependency Injection
# ============================================================================

async def get_current_user(
    credentials: Any = Depends(security)
) -> Dict[str, Any]:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer credentials

    Returns:
        Decoded token payload with user information

    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials

    try:
        payload = verify_token(token)
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_optional_user(
    credentials: Optional[Any] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Get current user if authenticated, None otherwise.

    Args:
        credentials: Optional HTTP Bearer credentials

    Returns:
        Decoded token payload or None
    """
    if not credentials:
        return None

    try:
        return verify_token(credentials.credentials)
    except JWTError:
        return None


# ============================================================================
# API Key Authentication (Fallback for automation)
# ============================================================================

def generate_api_key() -> str:
    """
    Generate a new API key.

    Returns:
        Random API key string
    """
    return secrets.token_urlsafe(32)


def verify_api_key(api_key: str) -> bool:
    """
    Verify an API key against stored keys.

    Args:
        api_key: API key to verify

    Returns:
        True if valid, False otherwise
    """
    # This would typically check against a database
    # For now, just verify it's a valid format
    return len(api_key) > 16


# ============================================================================
# Token Payload Management
# ============================================================================

class TokenData:
    """Helper class for managing token data."""

    def __init__(self, user_id: str, payload: Dict[str, Any]):
        self.user_id = user_id
        self.payload = payload

    @property
    def is_refresh_token(self) -> bool:
        """Check if this is a refresh token."""
        return self.payload.get("type") == "refresh"

    @property
    def is_access_token(self) -> bool:
        """Check if this is an access token."""
        return self.payload.get("type") != "refresh"

    @property
    def is_expired(self) -> bool:
        """Check if token is expired."""
        exp = self.payload.get("exp")
        if not exp:
            return True

        exp_time = datetime.fromtimestamp(exp, tz=timezone.utc)
        return datetime.now(timezone.utc) > exp_time

    def get_remaining_time(self) -> Optional[timedelta]:
        """Get remaining time until token expiration."""
        exp = self.payload.get("exp")
        if not exp:
            return None

        exp_time = datetime.fromtimestamp(exp, tz=timezone.utc)
        remaining = exp_time - datetime.now(timezone.utc)

        return remaining if remaining.total_seconds() > 0 else None
