"""
DLC Unlocker management routes.

Handles DLC Unlocker installation, uninstallation, and status checking.
"""

import logging
from typing import Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status, Depends

from api.models import (
    UnlockerStatus, ClientInfo, UnlockerInstallResponse,
    UnlockerUninstallResponse, ClientType
)
from api.security import get_current_user
from api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/unlocker", tags=["DLC Unlocker"])

# Mock unlocker state
unlocker_state = {
    "installed": False,
    "client": None,
    "config_exists": False,
    "sims4_config_exists": False,
    "version_dll_exists": False
}


# ============================================================================
# Get Unlocker Status
# ============================================================================

@router.get("/status", response_model=UnlockerStatus)
async def get_unlocker_status(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UnlockerStatus:
    """
    Get DLC Unlocker installation status.

    Args:
        current_user: Current authenticated user

    Returns:
        Unlocker installation status
    """
    logger.info("Fetching DLC Unlocker status")

    return UnlockerStatus(**unlocker_state)


# ============================================================================
# Detect EA App/Origin
# ============================================================================

@router.post("/detect", response_model=ClientInfo)
async def detect_client(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ClientInfo:
    """
    Detect EA App or Origin installation.

    Searches for EA App or Origin in standard installation locations
    and the Windows Registry.

    Args:
        current_user: Current authenticated user

    Returns:
        Detected client information

    Raises:
        HTTPException: If no client found
    """
    logger.info("Detecting EA App/Origin installation")

    # In production, use dlc_unlocker module for registry detection
    # Mock detection
    detected_client = ClientType.EA_APP
    detected_path = "C:\\Program Files\\EA Games\\EA App"

    return ClientInfo(
        client=detected_client,
        path=detected_path,
        version="12.0.0",
        is_running=False
    )


# ============================================================================
# Install DLC Unlocker
# ============================================================================

@router.post("/install", response_model=UnlockerInstallResponse, status_code=status.HTTP_202_ACCEPTED)
async def install_unlocker(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UnlockerInstallResponse:
    """
    Install DLC Unlocker.

    Executes DLC Unlocker setup script to install DLL files into
    EA App or Origin installation.

    Args:
        current_user: Current authenticated user

    Returns:
        Installation result

    Raises:
        HTTPException: If installation cannot be started
    """
    logger.info("Starting DLC Unlocker installation")

    global unlocker_state

    # Check if already installed
    if unlocker_state["installed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DLC Unlocker is already installed"
        )

    # In production, use dlc_unlocker module
    # For now, simulate installation
    unlocker_state = {
        "installed": True,
        "client": "ea_app",
        "config_exists": True,
        "sims4_config_exists": True,
        "version_dll_exists": True
    }

    logger.info("DLC Unlocker installed successfully")

    return UnlockerInstallResponse(
        success=True,
        message="DLC Unlocker installed successfully",
        client_used=ClientType.EA_APP,
        installation_time=15.5
    )


# ============================================================================
# Uninstall DLC Unlocker
# ============================================================================

@router.post("/uninstall", response_model=UnlockerUninstallResponse)
async def uninstall_unlocker(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UnlockerUninstallResponse:
    """
    Uninstall DLC Unlocker.

    Removes DLC Unlocker DLL files and configurations.

    Args:
        current_user: Current authenticated user

    Returns:
        Uninstallation result

    Raises:
        HTTPException: If DLC Unlocker not installed
    """
    logger.info("Starting DLC Unlocker uninstallation")

    global unlocker_state

    # Check if installed
    if not unlocker_state["installed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DLC Unlocker is not installed"
        )

    # In production, use dlc_unlocker module for cleanup
    # For now, simulate uninstallation
    unlocker_state = {
        "installed": False,
        "client": None,
        "config_exists": False,
        "sims4_config_exists": False,
        "version_dll_exists": False
    }

    logger.info("DLC Unlocker uninstalled successfully")

    return UnlockerUninstallResponse(
        success=True,
        message="DLC Unlocker uninstalled successfully",
        cleanup_time=5.2
    )


# ============================================================================
# Get Unlocker Config
# ============================================================================

@router.get("/config", response_model=Dict[str, Any])
async def get_unlocker_config(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get DLC Unlocker configuration.

    Args:
        current_user: Current authenticated user

    Returns:
        Unlocker configuration

    Raises:
        HTTPException: If unlocker not installed
    """
    logger.info("Fetching DLC Unlocker configuration")

    if not unlocker_state["installed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DLC Unlocker is not installed"
        )

    # In production, read actual config.ini file
    return {
        "language": "English",
        "auto_update": True,
        "dlc_count": 136,
        "config_version": "2.0.0",
        "last_updated": datetime.now(timezone.utc)
    }
