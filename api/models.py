"""
Data models for Sims 4 Updater API.

Pydantic models for request/response validation and type safety.
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class DLCType(str, Enum):
    """DLC content types."""
    EXPANSION = "expansion"
    STUFF = "stuff"
    COMMUNITY = "community"
    GAME_PACK = "game_pack"


class DLCStatus(str, Enum):
    """DLC installation status."""
    INSTALLED = "installed"
    MISSING = "missing"
    UPDATE_AVAILABLE = "update_available"


class UpdateStatus(str, Enum):
    """Update operation status."""
    PENDING = "pending"
    DOWNLOADING = "downloading"
    PATCHING = "patching"
    COMPLETE = "complete"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ClientType(str, Enum):
    """EA App or Origin."""
    EA_APP = "ea_app"
    ORIGIN = "origin"


class ContentType(str, Enum):
    """Type of content discovered by scraper."""
    PATCH = "patch"
    DLC = "dlc"
    MOD = "mod"
    MIRROR = "mirror"


# ============================================================================
# User & Authentication
# ============================================================================

class UserBase(BaseModel):
    """Base user model."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """User registration model."""
    password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    """User response model."""
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Login request model."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: str  # user_id
    exp: datetime
    iat: datetime


# ============================================================================
# Game & Status
# ============================================================================

class GameStatus(BaseModel):
    """Current game status."""
    current_version: str
    installation_path: str
    last_updated: Optional[datetime] = None
    is_installed: bool
    is_patched: bool
    size_mb: float
    needs_update: bool


class VersionInfo(BaseModel):
    """Available game version."""
    version: str
    release_date: datetime
    description: str
    size_mb: float
    file_count: int
    is_available: bool


class ManifestResponse(BaseModel):
    """Manifest file response."""
    version: str
    base_game: str
    patches: List[str]
    dlcs: List[Dict[str, Any]]
    created_at: datetime


# ============================================================================
# DLC Management
# ============================================================================

class DLCInfo(BaseModel):
    """DLC information."""
    id: str
    name: str
    dlc_type: DLCType
    status: DLCStatus
    version: Optional[str] = None
    installed_at: Optional[datetime] = None
    release_date: datetime
    description: str
    folder_name: Optional[str] = None


class DLCListResponse(BaseModel):
    """List of DLCs."""
    dlcs: List[DLCInfo]
    total: int
    installed: int
    missing: int
    updates_available: int


class DependencyInfo(BaseModel):
    """DLC dependency information."""
    pack_id: str
    requires: List[str]
    required_by: List[str]


class ResolveDependenciesRequest(BaseModel):
    """Request to resolve DLC dependencies."""
    selected_packs: List[str]


class ResolveDependenciesResponse(BaseModel):
    """Resolved dependencies response."""
    selected: List[str]
    required: List[str]
    all_required: List[str]
    conflicts: List[str]


# ============================================================================
# Updates & Patches
# ============================================================================

class UpdateProgress(BaseModel):
    """Update operation progress."""
    id: str
    status: UpdateStatus
    current_bytes: int
    total_bytes: int
    percent: float
    speed_mbps: Optional[float] = None
    eta_seconds: Optional[int] = None
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class VerifyRequest(BaseModel):
    """Game integrity verification request."""
    check_dlcs: bool = True
    deep_scan: bool = False


class VerifyResponse(BaseModel):
    """Game integrity verification response."""
    is_valid: bool
    missing_files: List[str]
    corrupted_files: List[str]
    verification_time_seconds: float


class CheckUpdatesResponse(BaseModel):
    """Available updates response."""
    current_version: str
    latest_version: Optional[str] = None
    update_available: bool
    patches_available: List[VersionInfo]


class ApplyUpdateRequest(BaseModel):
    """Apply update request."""
    target_version: str
    selected_dlcs: Optional[List[str]] = None


# ============================================================================
# Mirrors & Downloads
# ============================================================================

class MirrorInfo(BaseModel):
    """Mirror server information."""
    id: str
    url: str
    name: str
    location: Optional[str] = None
    latency_ms: Optional[int] = None
    is_healthy: bool
    weight: int
    last_checked: datetime


class MirrorListResponse(BaseModel):
    """List of mirrors."""
    mirrors: List[MirrorInfo]
    selected_mirror: Optional[str] = None


class MirrorHealthResponse(BaseModel):
    """Mirror health check response."""
    mirror_id: str
    is_healthy: bool
    latency_ms: int
    response_time: datetime


class SelectMirrorRequest(BaseModel):
    """Select preferred mirror."""
    mirror_id: str


# ============================================================================
# Web Scraper
# ============================================================================

class SearchResult(BaseModel):
    """Discovered content from scraper."""
    id: str
    title: str
    url: str
    snippet: str
    source: str  # 'google', 'known_sites', 'rss', etc.
    content_type: ContentType
    version: Optional[str] = None
    priority: int = Field(default=5, ge=1, le=10)
    trust_score: int = Field(default=50, ge=0, le=100)
    is_safe: bool
    discovered_at: datetime
    mirrors: List[str] = []
    metadata: Dict[str, Any] = {}


class DiscoverContentRequest(BaseModel):
    """Request to discover content."""
    content_type: ContentType = ContentType.PATCH
    game: str = "Sims 4"
    version: Optional[str] = None
    sources: List[str] = Field(default=["known_sites", "rss"])
    use_cache: bool = True


class DiscoverySession(BaseModel):
    """Content discovery session."""
    id: str
    status: str  # "searching" | "complete" | "failed"
    content_type: ContentType
    sources: List[str]
    results_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None


class DiscoverContentResponse(BaseModel):
    """Discovery results response."""
    session_id: str
    results: List[SearchResult]
    total_found: int
    sources_used: List[str]
    cache_hit: bool
    discovered_at: datetime


class ValidateURLRequest(BaseModel):
    """Request to validate discovered URL."""
    url: str
    content_type: Optional[ContentType] = None


class ValidateURLResponse(BaseModel):
    """URL validation response."""
    url: str
    is_safe: bool
    trust_score: int
    warnings: List[str]
    domain: str
    is_trusted: bool


# ============================================================================
# DLC Unlocker
# ============================================================================

class UnlockerStatus(BaseModel):
    """DLC Unlocker installation status."""
    installed: bool
    client: Optional[ClientType] = None
    config_exists: bool
    sims4_config_exists: bool
    version_dll_exists: bool


class ClientInfo(BaseModel):
    """EA App or Origin client information."""
    client: Optional[ClientType] = None
    path: Optional[str] = None
    version: Optional[str] = None
    is_running: bool = False


class UnlockerInstallResponse(BaseModel):
    """Unlocker installation response."""
    success: bool
    message: str
    client_used: Optional[ClientType] = None
    installation_time: Optional[float] = None


class UnlockerUninstallResponse(BaseModel):
    """Unlocker uninstallation response."""
    success: bool
    message: str
    cleanup_time: Optional[float] = None


# ============================================================================
# Settings
# ============================================================================

class AppSettings(BaseModel):
    """Application settings."""
    game_directory: str
    manifest_url: Optional[str] = None
    preferred_mirror: Optional[str] = None
    auto_check_updates: bool = True
    check_interval_hours: int = 24
    enable_notifications: bool = True
    language: str = "en"
    theme: str = "dark"


class GameDirectoryRequest(BaseModel):
    """Set game directory request."""
    path: str

    @field_validator('path')
    def validate_path(cls, v):
        """Validate game directory path."""
        if not v:
            raise ValueError('Game directory path cannot be empty')
        return v


class SettingsUpdate(BaseModel):
    """Settings update request."""
    game_directory: Optional[str] = None
    manifest_url: Optional[str] = None
    preferred_mirror: Optional[str] = None
    auto_check_updates: Optional[bool] = None
    check_interval_hours: Optional[int] = None
    enable_notifications: Optional[bool] = None
    language: Optional[str] = None
    theme: Optional[str] = None


# ============================================================================
# Health & Diagnostics
# ============================================================================

class HealthResponse(BaseModel):
    """API health check response."""
    status: str = "healthy"
    version: str
    uptime_seconds: float
    timestamp: datetime


class StatsResponse(BaseModel):
    """Server statistics."""
    active_connections: int
    total_requests: int
    avg_response_time_ms: float
    cache_size_mb: float
    database_size_mb: float
    uptime_seconds: float


class LogEntry(BaseModel):
    """Log entry for streaming."""
    timestamp: datetime
    level: str
    message: str
    source: str


# ============================================================================
# Error Responses
# ============================================================================

class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
    error_code: str
    status_code: int
    timestamp: datetime


class ValidationErrorResponse(BaseModel):
    """Validation error response."""
    detail: str
    errors: List[Dict[str, Any]]
    status_code: int = 422
    timestamp: datetime
