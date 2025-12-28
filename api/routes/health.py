"""
Health check and diagnostics routes.

Provides API health status and system diagnostics.
"""

import logging
import time
from typing import Dict, Any
from datetime import datetime, timezone

from fastapi import APIRouter

from api.models import HealthResponse, StatsResponse, LogEntry
from api.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health & Diagnostics"])

# Start time for uptime calculation
START_TIME = time.time()

# Request statistics
request_stats = {
    "total_requests": 0,
    "total_response_time": 0.0,
    "active_connections": 0
}


# ============================================================================
# Health Check
# ============================================================================

@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns server status and uptime.

    Returns:
        HealthResponse with status information
    """
    uptime = time.time() - START_TIME

    return HealthResponse(
        status="healthy",
        version=settings.PROJECT_VERSION,
        uptime_seconds=uptime,
        timestamp=datetime.now(timezone.utc)
    )


@router.get("/api/v1/health", response_model=HealthResponse)
async def api_health_check() -> HealthResponse:
    """
    API health check endpoint.

    Returns:
        HealthResponse with server status
    """
    uptime = time.time() - START_TIME

    return HealthResponse(
        status="healthy",
        version=settings.PROJECT_VERSION,
        uptime_seconds=uptime,
        timestamp=datetime.now(timezone.utc)
    )


# ============================================================================
# Statistics
# ============================================================================

@router.get("/api/v1/stats", response_model=StatsResponse)
async def get_statistics() -> StatsResponse:
    """
    Get API statistics and performance metrics.

    Returns:
        Server statistics and metrics
    """
    logger.info("Fetching API statistics")

    uptime = time.time() - START_TIME
    avg_response_time = (
        request_stats["total_response_time"] / request_stats["total_requests"]
        if request_stats["total_requests"] > 0
        else 0
    )

    return StatsResponse(
        active_connections=request_stats["active_connections"],
        total_requests=request_stats["total_requests"],
        avg_response_time_ms=avg_response_time * 1000,
        cache_size_mb=1.5,  # Dummy value
        database_size_mb=10.0,  # Dummy value
        uptime_seconds=uptime
    )


# ============================================================================
# Server Info
# ============================================================================

@router.get("/info", response_model=Dict[str, Any])
async def get_server_info() -> Dict[str, Any]:
    """
    Get server information and configuration.

    Returns:
        Server information
    """
    logger.info("Fetching server information")

    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "api_prefix": settings.API_PREFIX,
        "api_url": settings.get_api_url(),
        "debug": settings.DEBUG,
        "cors_origins": settings.CORS_ORIGINS
    }


# ============================================================================
# Version Check
# ============================================================================

@router.get("/version", response_model=Dict[str, str])
async def get_version() -> Dict[str, str]:
    """
    Get API version.

    Returns:
        API version information
    """
    return {
        "version": settings.PROJECT_VERSION,
        "name": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }


# ============================================================================
# Configuration Status
# ============================================================================

@router.get("/api/v1/config-status", response_model=Dict[str, Any])
async def get_config_status() -> Dict[str, Any]:
    """
    Get configuration status.

    Shows which optional features are configured.

    Returns:
        Configuration status
    """
    logger.info("Checking configuration status")

    return {
        "game_directory_configured": bool(settings.GAME_DIRECTORY),
        "manifest_url_configured": bool(settings.MANIFEST_URL),
        "google_api_configured": bool(settings.GOOGLE_API_KEY),
        "bing_api_configured": bool(settings.BING_API_KEY),
        "virustotal_configured": bool(settings.VIRUSTOTAL_API_KEY),
        "scraper_sources": {
            "google": settings.SCRAPER_ENABLE_GOOGLE,
            "bing": settings.SCRAPER_ENABLE_BING,
            "known_sites": settings.SCRAPER_ENABLE_KNOWN_SITES,
            "rss": settings.SCRAPER_ENABLE_RSS
        },
        "rate_limiting_enabled": settings.RATE_LIMIT_ENABLED
    }


# ============================================================================
# Ready Check
# ============================================================================

@router.get("/ready", response_model=Dict[str, Any])
async def ready_check() -> Dict[str, Any]:
    """
    Readiness check for orchestration systems.

    Used by Docker/Kubernetes to determine if service is ready to accept traffic.

    Returns:
        Readiness status
    """
    logger.debug("Performing readiness check")

    is_ready = True
    issues = []

    if not settings.GAME_DIRECTORY:
        issues.append("Game directory not configured")

    if not settings.MANIFEST_URL:
        issues.append("Manifest URL not configured")

    return {
        "ready": is_ready and len(issues) == 0,
        "issues": issues,
        "timestamp": datetime.now(timezone.utc)
    }
