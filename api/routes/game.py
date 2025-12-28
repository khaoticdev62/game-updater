"""
Game status and version management routes.

Handles game version discovery, status checks, and manifest fetching.
"""

import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, status, Depends

from api.models import (
    GameStatus, VersionInfo, ManifestResponse
)
from api.security import get_current_user
from api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/game", tags=["Game Management"])

# Mock data (replace with real game detection)
MOCK_GAME_STATUS = {
    "current_version": "1.108.329",
    "installation_path": "C:\\Program Files\\EA Games\\The Sims 4",
    "last_updated": datetime.now(timezone.utc),
    "is_installed": True,
    "is_patched": True,
    "size_mb": 52000.0,
    "needs_update": False
}

MOCK_VERSIONS = [
    VersionInfo(
        version="1.108.329",
        release_date=datetime(2024, 1, 15, tzinfo=timezone.utc),
        description="Latest patch",
        size_mb=500,
        file_count=245,
        is_available=True
    ),
    VersionInfo(
        version="1.108.328",
        release_date=datetime(2024, 1, 8, tzinfo=timezone.utc),
        description="Previous patch",
        size_mb=450,
        file_count=200,
        is_available=True
    ),
]


# ============================================================================
# Game Status
# ============================================================================

@router.get("/status", response_model=GameStatus)
async def get_game_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> GameStatus:
    """
    Get current game installation status.

    Args:
        current_user: Current authenticated user

    Returns:
        Current game status

    Raises:
        HTTPException: If game not found
    """
    logger.info("Fetching game status")

    # In production, detect actual game installation
    if not settings.GAME_DIRECTORY:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Game directory not configured"
        )

    return GameStatus(**MOCK_GAME_STATUS)


# ============================================================================
# Available Versions
# ============================================================================

@router.get("/versions", response_model=List[VersionInfo])
async def list_available_versions(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[VersionInfo]:
    """
    List all available game versions.

    Args:
        current_user: Current authenticated user

    Returns:
        List of available versions

    Raises:
        HTTPException: If manifest fetch fails
    """
    logger.info("Fetching available versions")

    if not settings.MANIFEST_URL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manifest URL not configured"
        )

    # In production, fetch from manifest
    return MOCK_VERSIONS


# ============================================================================
# Version Discovery
# ============================================================================

@router.post("/discover-versions", response_model=Dict[str, Any])
async def discover_versions(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Scan manifest index for new versions.

    Performs version discovery by scanning the manifest index page
    for available versions.

    Args:
        current_user: Current authenticated user

    Returns:
        Discovery results

    Raises:
        HTTPException: If discovery fails
    """
    logger.info("Starting version discovery")

    if not settings.MANIFEST_URL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manifest URL not configured"
        )

    # In production, use VersionScanner from manifest.py
    return {
        "discovered_versions": [v.version for v in MOCK_VERSIONS],
        "total": len(MOCK_VERSIONS),
        "latest": MOCK_VERSIONS[0].version,
        "timestamp": datetime.now(timezone.utc)
    }


# ============================================================================
# Manifest
# ============================================================================

@router.get("/manifest/{version}", response_model=ManifestResponse)
async def get_manifest(
    version: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ManifestResponse:
    """
    Get manifest for a specific game version.

    Args:
        version: Version number (e.g., "1.108.329")
        current_user: Current authenticated user

    Returns:
        Manifest for the specified version

    Raises:
        HTTPException: If version not found
    """
    logger.info(f"Fetching manifest for version: {version}")

    if not settings.MANIFEST_URL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Manifest URL not configured"
        )

    # Validate version format
    if not all(part.isdigit() for part in version.split(".")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid version format"
        )

    # In production, fetch actual manifest
    return ManifestResponse(
        version=version,
        base_game="The Sims 4",
        patches=[],
        dlcs=[
            {
                "id": "EP01",
                "name": "Get to Work",
                "size_mb": 5000,
                "included": True
            }
        ],
        created_at=datetime.now(timezone.utc)
    )


# ============================================================================
# Version Details
# ============================================================================

@router.get("/versions/{version}", response_model=VersionInfo)
async def get_version_details(
    version: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> VersionInfo:
    """
    Get detailed information for a specific version.

    Args:
        version: Version number
        current_user: Current authenticated user

    Returns:
        Version information

    Raises:
        HTTPException: If version not found
    """
    logger.info(f"Fetching version details: {version}")

    # Find version in mock data
    for v in MOCK_VERSIONS:
        if v.version == version:
            return v

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Version {version} not found"
    )
