"""
DLC management routes.

Handles DLC listing, status checking, and dependency resolution.
"""

import logging
from typing import List, Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from api.models import (
    DLCInfo, DLCListResponse, DLCType, DLCStatus,
    DependencyInfo, ResolveDependenciesRequest, ResolveDependenciesResponse
)
from api.security import get_current_user
from api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dlc", tags=["DLC Management"])

# Mock DLC database
MOCK_DLCS = [
    DLCInfo(
        id="EP01",
        name="Get to Work",
        dlc_type=DLCType.EXPANSION,
        status=DLCStatus.INSTALLED,
        version="1.0.0",
        installed_at=datetime(2023, 1, 1, tzinfo=timezone.utc),
        release_date=datetime(2015, 3, 31, tzinfo=timezone.utc),
        description="First Expansion Pack",
        folder_name="Expansion01"
    ),
    DLCInfo(
        id="EP02",
        name="Get Together",
        dlc_type=DLCType.EXPANSION,
        status=DLCStatus.MISSING,
        version=None,
        installed_at=None,
        release_date=datetime(2015, 6, 9, tzinfo=timezone.utc),
        description="Second Expansion Pack",
        folder_name="Expansion02"
    ),
    DLCInfo(
        id="SP01",
        name="Luxury Party Stuff",
        dlc_type=DLCType.STUFF,
        status=DLCStatus.INSTALLED,
        version="1.0.0",
        installed_at=datetime(2023, 2, 1, tzinfo=timezone.utc),
        release_date=datetime(2015, 4, 7, tzinfo=timezone.utc),
        description="First Stuff Pack",
        folder_name="Stuff01"
    ),
]

# Mock DLC dependencies
DLC_DEPENDENCIES = {
    "EP01": ["Base"],
    "EP02": ["Base", "EP01"],
    "SP01": ["Base"],
}


# ============================================================================
# List DLCs
# ============================================================================

@router.get("", response_model=DLCListResponse)
async def list_dlcs(
    status_filter: DLCStatus = None,
    dlc_type: DLCType = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> DLCListResponse:
    """
    List all DLCs with optional filtering.

    Args:
        status_filter: Filter by status (optional)
        dlc_type: Filter by type (optional)
        current_user: Current authenticated user

    Returns:
        List of DLCs with summary

    Raises:
        HTTPException: If game directory not configured
    """
    logger.info("Fetching DLC list")

    if not settings.GAME_DIRECTORY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game directory not configured"
        )

    # Filter DLCs
    dlcs = MOCK_DLCS.copy()

    if status_filter:
        dlcs = [d for d in dlcs if d.status == status_filter]

    if dlc_type:
        dlcs = [d for d in dlcs if d.dlc_type == dlc_type]

    installed = sum(1 for d in dlcs if d.status == DLCStatus.INSTALLED)
    missing = sum(1 for d in dlcs if d.status == DLCStatus.MISSING)
    updates = sum(1 for d in dlcs if d.status == DLCStatus.UPDATE_AVAILABLE)

    return DLCListResponse(
        dlcs=dlcs,
        total=len(dlcs),
        installed=installed,
        missing=missing,
        updates_available=updates
    )


# ============================================================================
# Get DLC Details
# ============================================================================

@router.get("/{dlc_id}", response_model=DLCInfo)
async def get_dlc(
    dlc_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> DLCInfo:
    """
    Get detailed information for a specific DLC.

    Args:
        dlc_id: DLC identifier (e.g., "EP01")
        current_user: Current authenticated user

    Returns:
        DLC information

    Raises:
        HTTPException: If DLC not found
    """
    logger.info(f"Fetching DLC details: {dlc_id}")

    for dlc in MOCK_DLCS:
        if dlc.id == dlc_id:
            return dlc

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"DLC {dlc_id} not found"
    )


# ============================================================================
# Scan DLC Status
# ============================================================================

@router.get("/status", response_model=Dict[str, Any])
async def scan_dlc_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Scan game directory for installed DLCs.

    Args:
        current_user: Current authenticated user

    Returns:
        DLC scan results

    Raises:
        HTTPException: If game directory not found
    """
    logger.info("Scanning DLC status")

    if not settings.GAME_DIRECTORY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Game directory not configured"
        )

    # In production, scan actual game directory
    return {
        "scanned_at": datetime.now(timezone.utc),
        "installed_dlcs": [d.id for d in MOCK_DLCS if d.status == DLCStatus.INSTALLED],
        "missing_dlcs": [d.id for d in MOCK_DLCS if d.status == DLCStatus.MISSING],
        "total_size_mb": sum(1000 for d in MOCK_DLCS if d.status == DLCStatus.INSTALLED)
    }


# ============================================================================
# DLC Dependencies
# ============================================================================

@router.get("/{dlc_id}/dependencies", response_model=DependencyInfo)
async def get_dlc_dependencies(
    dlc_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> DependencyInfo:
    """
    Get DLC dependencies.

    Args:
        dlc_id: DLC identifier
        current_user: Current authenticated user

    Returns:
        Dependency information

    Raises:
        HTTPException: If DLC not found
    """
    logger.info(f"Fetching dependencies for: {dlc_id}")

    if dlc_id not in DLC_DEPENDENCIES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"DLC {dlc_id} not found"
        )

    requires = DLC_DEPENDENCIES[dlc_id]
    required_by = [k for k, v in DLC_DEPENDENCIES.items() if dlc_id in v]

    return DependencyInfo(
        pack_id=dlc_id,
        requires=requires,
        required_by=required_by
    )


# ============================================================================
# Resolve Dependencies
# ============================================================================

@router.post("/resolve-dependencies", response_model=ResolveDependenciesResponse)
async def resolve_dependencies(
    request: ResolveDependenciesRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ResolveDependenciesResponse:
    """
    Resolve DLC dependencies for selected packs.

    Determines which DLCs are required based on the selected packs.

    Args:
        request: Selected packs
        current_user: Current authenticated user

    Returns:
        Resolved dependencies

    Raises:
        HTTPException: If dependency resolution fails
    """
    logger.info(f"Resolving dependencies for: {request.selected_packs}")

    # Resolve dependencies recursively
    required = set()
    to_process = set(request.selected_packs)

    while to_process:
        pack = to_process.pop()
        if pack in DLC_DEPENDENCIES:
            deps = DLC_DEPENDENCIES[pack]
            for dep in deps:
                if dep != "Base" and dep not in required and dep not in request.selected_packs:
                    required.add(dep)
                    to_process.add(dep)

    all_required = list(required.union(set(request.selected_packs)))

    return ResolveDependenciesResponse(
        selected=request.selected_packs,
        required=list(required),
        all_required=all_required,
        conflicts=[]
    )
