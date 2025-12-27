"""
Authentication routes.

Handles user registration, login, token refresh, and logout.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse

from api.models import (
    UserCreate, UserResponse, LoginRequest, TokenResponse,
    RefreshTokenRequest
)
from api.security import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, verify_token, get_current_user
)
from api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory user storage (replace with database in production)
users_db: Dict[str, Dict[str, Any]] = {}


# ============================================================================
# User Registration
# ============================================================================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate) -> UserResponse:
    """
    Register a new user.

    Args:
        user_data: User registration information

    Returns:
        Created user information

    Raises:
        HTTPException: If username already exists
    """
    # Check if user exists
    if user_data.username in users_db:
        logger.warning(f"Registration attempt with existing username: {user_data.username}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already registered"
        )

    # Create user
    user_id = f"user_{len(users_db) + 1}"
    users_db[user_data.username] = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc),
        "last_login": None
    }

    logger.info(f"New user registered: {user_data.username}")

    return UserResponse(
        id=user_id,
        username=user_data.username,
        email=user_data.email,
        created_at=datetime.now(timezone.utc),
        last_login=None
    )


# ============================================================================
# User Login
# ============================================================================

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest) -> TokenResponse:
    """
    Login user and return JWT tokens.

    Args:
        credentials: Login credentials

    Returns:
        Access and refresh tokens

    Raises:
        HTTPException: If credentials are invalid
    """
    user = users_db.get(credentials.username)

    if not user or not verify_password(credentials.password, user["password_hash"]):
        logger.warning(f"Failed login attempt for user: {credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login
    users_db[credentials.username]["last_login"] = datetime.now(timezone.utc)

    # Create tokens
    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])

    logger.info(f"User logged in: {credentials.username}")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


# ============================================================================
# Token Refresh
# ============================================================================

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest) -> TokenResponse:
    """
    Refresh an access token using a refresh token.

    Args:
        request: Refresh token request

    Returns:
        New access and refresh tokens

    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        payload = verify_token(request.refresh_token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        # Create new tokens
        access_token = create_access_token(user_id)
        refresh_token = create_refresh_token(user_id)

        logger.debug(f"Token refreshed for user: {user_id}")

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )


# ============================================================================
# Get Current User
# ============================================================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserResponse:
    """
    Get information about the currently authenticated user.

    Args:
        current_user: Current user from JWT token

    Returns:
        User information

    Raises:
        HTTPException: If user not found
    """
    user_id = current_user.get("sub")

    # Find user by ID
    for username, user_data in users_db.items():
        if user_data["id"] == user_id:
            return UserResponse(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                created_at=user_data["created_at"],
                last_login=user_data["last_login"]
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )


# ============================================================================
# Logout
# ============================================================================

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Logout the current user.

    In a real application, this would invalidate the token (add to blacklist).

    Args:
        current_user: Current user from JWT token
    """
    user_id = current_user.get("sub")
    logger.info(f"User logged out: {user_id}")

    # In production, add token to blacklist here
    return None
