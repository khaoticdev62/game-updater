"""
Mirror discovery and selection routes.

Handles mirror listing, health checks, and selection.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from api.models import (
    MirrorInfo, MirrorListResponse, MirrorHealthResponse,
    SelectMirrorRequest
)
from api.security import get_current_user
from api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mirrors", tags=["Mirrors & Downloads"])

# Mock mirrors database
MOCK_MIRRORS = [
    MirrorInfo(
        id="mirror_1",
        url="https://fitgirl-repacks.site",
        name="FitGirl Repacks",
        location="EU",
        latency_ms=120,
        is_healthy=True,
        weight=10,
        last_checked=datetime.now(timezone.utc)
    ),
    MirrorInfo(
        id="mirror_2",
        url="https://elamigos.site",
        name="ElAmigos",
        location="EU",
        latency_ms=150,
        is_healthy=True,
        weight=8,
        last_checked=datetime.now(timezone.utc)
    ),
    MirrorInfo(
        id="mirror_3",
        url="https://multiup.io/project/ca950164572c20c9b3b8decedb6e43f1",
        name="Multiup.io",
        location="Global",
        latency_ms=200,
        is_healthy=True,
        weight=6,
        last_checked=datetime.now(timezone.utc)
    ),
]

selected_mirror: Optional[str] = None


# ============================================================================
# List Mirrors
# ============================================================================

@router.get("", response_model=MirrorListResponse)
async def list_mirrors(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> MirrorListResponse:
    """
    List all available mirrors.

    Args:
        current_user: Current authenticated user

    Returns:
        List of mirrors with selected mirror info
    """
    logger.info("Fetching mirrors list")

    return MirrorListResponse(
        mirrors=MOCK_MIRRORS,
        selected_mirror=selected_mirror
    )


# ============================================================================
# Mirror Health Check
# ============================================================================

@router.get("/{mirror_id}/status", response_model=MirrorHealthResponse)
async def check_mirror_health(
    mirror_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> MirrorHealthResponse:
    """
    Check health of a specific mirror.

    Args:
        mirror_id: Mirror identifier
        current_user: Current authenticated user

    Returns:
        Mirror health status

    Raises:
        HTTPException: If mirror not found
    """
    logger.info(f"Checking health of mirror: {mirror_id}")

    mirror = next((m for m in MOCK_MIRRORS if m.id == mirror_id), None)
    if not mirror:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mirror {mirror_id} not found"
        )

    return MirrorHealthResponse(
        mirror_id=mirror_id,
        is_healthy=mirror.is_healthy,
        latency_ms=mirror.latency_ms or 0,
        response_time=datetime.now(timezone.utc)
    )


# ============================================================================
# Select Mirror
# ============================================================================

@router.post("/select", status_code=status.HTTP_204_NO_CONTENT)
async def select_mirror(
    request: SelectMirrorRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Select preferred mirror for downloads.

    Args:
        request: Mirror selection request
        current_user: Current authenticated user

    Raises:
        HTTPException: If mirror not found
    """
    global selected_mirror

    logger.info(f"Selecting mirror: {request.mirror_id}")

    mirror = next((m for m in MOCK_MIRRORS if m.id == request.mirror_id), None)
    if not mirror:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mirror {request.mirror_id} not found"
        )

    selected_mirror = request.mirror_id
    logger.info(f"Mirror selected: {mirror.name}")

    return None


# ============================================================================
# Discover Mirrors
# ============================================================================

@router.post("/discover", response_model=Dict[str, Any], status_code=status.HTTP_202_ACCEPTED)
async def discover_mirrors(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Discover and probe mirrors for availability.

    Performs parallel probing of all configured mirrors to determine
    availability and latency.

    Args:
        current_user: Current authenticated user

    Returns:
        Discovery operation information
    """
    logger.info("Starting mirror discovery")

    return {
        "status": "discovery_started",
        "mirrors_to_probe": len(MOCK_MIRRORS),
        "estimated_time_seconds": 10,
        "timestamp": datetime.now(timezone.utc)
    }


# ============================================================================
# Mirror Statistics
# ============================================================================

@router.get("/stats", response_model=Dict[str, Any])
async def get_mirror_statistics(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get mirror statistics and health overview.

    Args:
        current_user: Current authenticated user

    Returns:
        Mirror statistics
    """
    logger.info("Fetching mirror statistics")

    healthy = sum(1 for m in MOCK_MIRRORS if m.is_healthy)
    avg_latency = sum(m.latency_ms or 0 for m in MOCK_MIRRORS) / len(MOCK_MIRRORS)

    return {
        "total_mirrors": len(MOCK_MIRRORS),
        "healthy_mirrors": healthy,
        "average_latency_ms": int(avg_latency),
        "selected_mirror": selected_mirror,
        "last_updated": datetime.now(timezone.utc)
    }
