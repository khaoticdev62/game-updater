"""API route handlers."""

from fastapi import APIRouter

from . import auth, game, dlc, updates, mirrors, scraper, unlocker, settings, health

# Create API router
api_router = APIRouter(prefix="/api/v1")

# Include routers
api_router.include_router(auth.router)
api_router.include_router(game.router)
api_router.include_router(dlc.router)
api_router.include_router(updates.router)
api_router.include_router(mirrors.router)
api_router.include_router(scraper.router)
api_router.include_router(unlocker.router)
api_router.include_router(settings.router)
api_router.include_router(health.router)

__all__ = ["api_router"]
