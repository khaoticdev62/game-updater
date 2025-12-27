"""
API configuration management.

Loads configuration from environment variables and .env files.
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """API configuration settings."""

    # Basic
    PROJECT_NAME: str = "Sims 4 Updater API"
    PROJECT_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"

    # API Server
    API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_PREFIX: str = "/api/v1"
    RELOAD: bool = DEBUG

    # Security
    API_SECRET_KEY: str = os.getenv("API_SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8000"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]

    # Database
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    DATABASE_ECHO: bool = DEBUG

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO" if not DEBUG else "DEBUG")
    LOG_FILE: Optional[str] = os.getenv("LOG_FILE")

    # Game
    GAME_DIRECTORY: Optional[str] = os.getenv("GAME_DIRECTORY")
    MANIFEST_URL: Optional[str] = os.getenv("MANIFEST_URL")

    # Web Scraper
    SCRAPER_CACHE_TTL_HOURS: int = int(os.getenv("SCRAPER_CACHE_TTL_HOURS", "24"))
    SCRAPER_MAX_RESULTS: int = int(os.getenv("SCRAPER_MAX_RESULTS", "50"))
    SCRAPER_ENABLE_GOOGLE: bool = os.getenv("SCRAPER_ENABLE_GOOGLE", "false").lower() == "true"
    SCRAPER_ENABLE_BING: bool = os.getenv("SCRAPER_ENABLE_BING", "false").lower() == "true"
    SCRAPER_ENABLE_KNOWN_SITES: bool = os.getenv("SCRAPER_ENABLE_KNOWN_SITES", "true").lower() == "true"
    SCRAPER_ENABLE_RSS: bool = os.getenv("SCRAPER_ENABLE_RSS", "true").lower() == "true"

    # Search APIs
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY")
    GOOGLE_CSE_ID: Optional[str] = os.getenv("GOOGLE_CSE_ID")
    BING_API_KEY: Optional[str] = os.getenv("BING_API_KEY")

    # Virus Scanning
    VIRUSTOTAL_API_KEY: Optional[str] = os.getenv("VIRUSTOTAL_API_KEY")

    # WebSocket
    WEBSOCKET_MAX_CONNECTIONS: int = int(os.getenv("WEBSOCKET_MAX_CONNECTIONS", "100"))

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_PERIOD_SECONDS: int = int(os.getenv("RATE_LIMIT_PERIOD_SECONDS", "60"))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    def is_production(self) -> bool:
        """Check if running in production."""
        return self.ENVIRONMENT == "production"

    def is_development(self) -> bool:
        """Check if running in development."""
        return self.ENVIRONMENT == "development"

    def get_api_url(self) -> str:
        """Get full API URL."""
        protocol = "https" if self.is_production() else "http"
        return f"{protocol}://{self.API_HOST}:{self.API_PORT}"


# Create global settings instance
settings = Settings()
