#!/usr/bin/env python
"""
Sims 4 Updater REST API Server.

Standalone FastAPI application for The Sims 4 Updater with full REST API support.

Usage:
    # Development with hot reload
    python api_server.py

    # Production with Gunicorn
    gunicorn api.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker

    # Using Uvicorn directly
    uvicorn api.main:app --host 0.0.0.0 --port 8000
"""

import os
import sys
import logging
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def main():
    """Main entry point for API server."""
    import uvicorn
    from api.config import settings

    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.PROJECT_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Server: {settings.API_HOST}:{settings.API_PORT}")

    # Run server
    uvicorn.run(
        "api.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True,
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("API server stopped by user")
        sys.exit(0)
    except Exception as e:
        logger.exception(f"API server error: {e}")
        sys.exit(1)
