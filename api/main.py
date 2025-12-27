"""
Sims 4 Updater REST API.

FastAPI application with full CRUD operations for game updates, DLC management,
web scraping, and DLC unlocker integration.
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi

from api.config import settings
from api.models import HealthResponse, ErrorResponse

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# Lifespan Management
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.PROJECT_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"API running at {settings.get_api_url()}{settings.API_PREFIX}")

    yield

    logger.info("Shutting down API server")


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="REST API for The Sims 4 Updater with DLC management, web scraping, and update automation",
    version=settings.PROJECT_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ============================================================================
# Middleware
# ============================================================================

# CORS Middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )


# Custom exception handler for 404s
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
    )


# ============================================================================
# Health Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns server status and uptime.
    """
    return HealthResponse(
        status="healthy",
        version=settings.PROJECT_VERSION,
        uptime_seconds=0,  # Would be calculated from app start time
        timestamp=datetime.now(timezone.utc)
    )


@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
async def api_health_check() -> HealthResponse:
    """
    API health check endpoint.

    Returns:
        HealthResponse with server status
    """
    return HealthResponse(
        status="healthy",
        version=settings.PROJECT_VERSION,
        uptime_seconds=0,
        timestamp=datetime.now(timezone.utc)
    )


# ============================================================================
# Root Endpoint
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    API root endpoint.

    Returns information about the API.
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "openapi": "/openapi.json",
        "api_prefix": settings.API_PREFIX
    }


@app.get(f"{settings.API_PREFIX}/", tags=["Root"])
async def api_root():
    """API root endpoint."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "endpoints": {
            "auth": f"{settings.API_PREFIX}/auth",
            "game": f"{settings.API_PREFIX}/game",
            "dlc": f"{settings.API_PREFIX}/dlc",
            "updates": f"{settings.API_PREFIX}/updates",
            "mirrors": f"{settings.API_PREFIX}/mirrors",
            "scraper": f"{settings.API_PREFIX}/scraper",
            "unlocker": f"{settings.API_PREFIX}/unlocker",
            "settings": f"{settings.API_PREFIX}/settings",
            "health": f"{settings.API_PREFIX}/health",
        }
    }


# ============================================================================
# Custom OpenAPI Schema
# ============================================================================

def custom_openapi():
    """Generate custom OpenAPI schema."""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        description="REST API for The Sims 4 Updater",
        routes=app.routes,
    )

    # Add authentication scheme
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT Bearer token for authentication"
        }
    }

    # Add API info
    openapi_schema["info"]["x-logo"] = {
        "url": "https://simscommunity.info/favicon.ico",
        "altText": "Sims 4 Logo"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


# ============================================================================
# Route Registration
# ============================================================================

from api.routes import api_router
from api.routes import health

# Include API routers
app.include_router(api_router)
app.include_router(health.router)


# ============================================================================
# Error Handling
# ============================================================================

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle uncaught exceptions."""
    logger.exception(f"Uncaught exception: {exc}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "status_code": 500,
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
    )


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower(),
    )
