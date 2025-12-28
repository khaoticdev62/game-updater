"""
Application settings routes.

Handles application configuration and user preferences.
"""

import logging
from typing import Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from api.models import (
    AppSettings, SettingsUpdate, GameDirectoryRequest
)
from api.security import get_current_user
from api.config import settings as config_settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settings", tags=["Settings"])

# In-memory user settings (replace with database in production)
user_settings: Dict[str, AppSettings] = {}


def get_user_settings(user_id: str) -> AppSettings:
    """Get settings for a user."""
    if user_id not in user_settings:
        user_settings[user_id] = AppSettings(
            game_directory=config_settings.GAME_DIRECTORY or "",
            manifest_url=config_settings.MANIFEST_URL,
            preferred_mirror=None,
            auto_check_updates=True,
            check_interval_hours=24,
            enable_notifications=True,
            language="en",
            theme="dark"
        )
    return user_settings[user_id]


# ============================================================================
# Get Settings
# ============================================================================

@router.get("", response_model=AppSettings)
async def get_settings(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> AppSettings:
    """
    Get application settings for current user.

    Args:
        current_user: Current authenticated user

    Returns:
        User settings
    """
    logger.info("Fetching user settings")

    user_id = current_user.get("sub")
    return get_user_settings(user_id)


# ============================================================================
# Update Settings
# ============================================================================

@router.patch("", response_model=AppSettings)
async def update_settings(
    request: SettingsUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> AppSettings:
    """
    Update application settings.

    Args:
        request: Settings update
        current_user: Current authenticated user

    Returns:
        Updated settings
    """
    logger.info("Updating user settings")

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)

    # Update provided fields
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    logger.info(f"Settings updated for user: {user_id}")

    return settings


# ============================================================================
# Game Directory
# ============================================================================

@router.get("/game-dir", response_model=Dict[str, str])
async def get_game_directory(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Get configured game directory.

    Args:
        current_user: Current authenticated user

    Returns:
        Game directory path

    Raises:
        HTTPException: If game directory not configured
    """
    logger.info("Fetching game directory setting")

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)

    if not settings.game_directory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game directory not configured"
        )

    return {"game_directory": settings.game_directory}


@router.post("/game-dir", response_model=Dict[str, str])
async def set_game_directory(
    request: GameDirectoryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Set game installation directory.

    Args:
        request: Game directory path
        current_user: Current authenticated user

    Returns:
        Confirmation of set directory

    Raises:
        HTTPException: If path is invalid
    """
    logger.info(f"Setting game directory: {request.path}")

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)

    # In production, validate that directory exists and contains game files
    settings.game_directory = request.path

    logger.info(f"Game directory set for user: {user_id}")

    return {"game_directory": request.path}


# ============================================================================
# Manifest URL
# ============================================================================

@router.get("/manifest-url", response_model=Dict[str, Any])
async def get_manifest_url(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get configured manifest URL.

    Args:
        current_user: Current authenticated user

    Returns:
        Manifest URL and source
    """
    logger.info("Fetching manifest URL setting")

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)

    return {
        "manifest_url": settings.manifest_url,
        "is_default": settings.manifest_url == config_settings.MANIFEST_URL
    }


@router.post("/manifest-url", response_model=Dict[str, str])
async def set_manifest_url(
    request: Dict[str, str],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Set manifest URL.

    Args:
        request: Manifest URL
        current_user: Current authenticated user

    Returns:
        Confirmation
    """
    logger.info("Setting manifest URL")

    manifest_url = request.get("manifest_url")
    if not manifest_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manifest URL cannot be empty"
        )

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)
    settings.manifest_url = manifest_url

    logger.info(f"Manifest URL set for user: {user_id}")

    return {"manifest_url": manifest_url}


# ============================================================================
# Theme & Language
# ============================================================================

@router.post("/theme", response_model=Dict[str, str])
async def set_theme(
    request: Dict[str, str],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Set application theme.

    Args:
        request: Theme name
        current_user: Current authenticated user

    Returns:
        Confirmation
    """
    theme = request.get("theme", "dark")
    valid_themes = ["light", "dark", "auto"]

    if theme not in valid_themes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid theme. Must be one of: {valid_themes}"
        )

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)
    settings.theme = theme

    return {"theme": theme}


@router.post("/language", response_model=Dict[str, str])
async def set_language(
    request: Dict[str, str],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Set application language.

    Args:
        request: Language code
        current_user: Current authenticated user

    Returns:
        Confirmation
    """
    language = request.get("language", "en")
    valid_languages = ["en", "es", "fr", "de", "ja", "zh"]

    if language not in valid_languages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language not supported: {language}"
        )

    user_id = current_user.get("sub")
    settings = get_user_settings(user_id)
    settings.language = language

    return {"language": language}


# ============================================================================
# Reset Settings
# ============================================================================

@router.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_settings(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Reset all settings to defaults.

    Args:
        current_user: Current authenticated user
    """
    logger.warning("Resetting settings to defaults")

    user_id = current_user.get("sub")

    if user_id in user_settings:
        del user_settings[user_id]

    logger.warning(f"Settings reset for user: {user_id}")

    return None
