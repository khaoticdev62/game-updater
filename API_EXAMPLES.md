# Sims 4 Updater API - Usage Examples

Complete examples of how to use the REST API for common operations.

## Authentication Flow

### 1. Register New User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gamerfan123",
    "email": "gamer@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "id": "user_1",
  "username": "gamerfan123",
  "email": "gamer@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "last_login": null
}
```

### 2. Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gamerfan123",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 3. Get Current User Info

```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "id": "user_1",
  "username": "gamerfan123",
  "email": "gamer@example.com",
  "created_at": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-15T10:35:20Z"
}
```

### 4. Refresh Access Token

```bash
curl -X POST "http://localhost:8000/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Game Management

### Get Game Status

```bash
curl -X GET "http://localhost:8000/api/v1/game/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "current_version": "1.108.329",
  "installation_path": "C:\\Program Files\\EA Games\\The Sims 4",
  "last_updated": "2024-01-10T15:45:00Z",
  "is_installed": true,
  "is_patched": true,
  "size_mb": 52000.0,
  "needs_update": false
}
```

### List Available Game Versions

```bash
curl -X GET "http://localhost:8000/api/v1/game/versions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
[
  {
    "version": "1.108.329",
    "release_date": "2024-01-15T00:00:00Z",
    "description": "Latest patch with bug fixes",
    "size_mb": 500,
    "file_count": 245,
    "is_available": true
  },
  {
    "version": "1.108.328",
    "release_date": "2024-01-08T00:00:00Z",
    "description": "Previous patch",
    "size_mb": 450,
    "file_count": 200,
    "is_available": true
  }
]
```

### Discover New Versions

```bash
curl -X POST "http://localhost:8000/api/v1/game/discover-versions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "discovered_versions": ["1.108.329", "1.108.328"],
  "total": 2,
  "latest": "1.108.329",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

---

## DLC Management

### List All DLCs

```bash
curl -X GET "http://localhost:8000/api/v1/dlc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "dlcs": [
    {
      "id": "EP01",
      "name": "Get to Work",
      "dlc_type": "expansion",
      "status": "installed",
      "version": "1.0.0",
      "installed_at": "2023-01-01T00:00:00Z",
      "release_date": "2015-03-31T00:00:00Z",
      "description": "First Expansion Pack",
      "folder_name": "Expansion01"
    },
    {
      "id": "EP02",
      "name": "Get Together",
      "dlc_type": "expansion",
      "status": "missing",
      "version": null,
      "installed_at": null,
      "release_date": "2015-06-09T00:00:00Z",
      "description": "Second Expansion Pack",
      "folder_name": "Expansion02"
    }
  ],
  "total": 2,
  "installed": 1,
  "missing": 1,
  "updates_available": 0
}
```

### Get DLC Dependencies

```bash
curl -X GET "http://localhost:8000/api/v1/dlc/EP02/dependencies" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "pack_id": "EP02",
  "requires": ["Base", "EP01"],
  "required_by": []
}
```

### Resolve DLC Dependencies

```bash
curl -X POST "http://localhost:8000/api/v1/dlc/resolve-dependencies" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "selected_packs": ["EP02", "SP01"]
  }'
```

**Response:**
```json
{
  "selected": ["EP02", "SP01"],
  "required": ["EP01"],
  "all_required": ["EP02", "SP01", "EP01"],
  "conflicts": []
}
```

### Scan DLC Status

```bash
curl -X GET "http://localhost:8000/api/v1/dlc/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "scanned_at": "2024-01-15T10:45:00Z",
  "installed_dlcs": ["EP01", "SP01"],
  "missing_dlcs": ["EP02", "EP03"],
  "total_size_mb": 15000
}
```

---

## Game Updates

### Verify Game Integrity

```bash
curl -X POST "http://localhost:8000/api/v1/updates/verify" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "check_dlcs": true,
    "deep_scan": false
  }'
```

**Response:**
```json
{
  "is_valid": true,
  "missing_files": [],
  "corrupted_files": [],
  "verification_time_seconds": 15.5
}
```

### Check for Updates

```bash
curl -X POST "http://localhost:8000/api/v1/updates/check" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "current_version": "1.108.329",
  "latest_version": "1.108.330",
  "update_available": true,
  "patches_available": [
    {
      "version": "1.108.330",
      "release_date": "2024-01-15T00:00:00Z",
      "description": "Latest patch",
      "size_mb": 500,
      "file_count": 245,
      "is_available": true
    }
  ]
}
```

### Apply Update

```bash
curl -X POST "http://localhost:8000/api/v1/updates/apply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_version": "1.108.330",
    "selected_dlcs": ["EP01", "SP01"]
  }'
```

**Response:**
```json
{
  "operation_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "target_version": "1.108.330",
  "estimated_time_seconds": 1800
}
```

### Get Update Progress

```bash
curl -X GET "http://localhost:8000/api/v1/updates/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "downloading",
  "current_bytes": 262144000,
  "total_bytes": 524288000,
  "percent": 50.0,
  "speed_mbps": 25.5,
  "eta_seconds": 600,
  "error_message": null,
  "started_at": "2024-01-15T10:50:00Z",
  "completed_at": null
}
```

### Cancel Update

```bash
curl -X DELETE "http://localhost:8000/api/v1/updates/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Mirror Management

### List Available Mirrors

```bash
curl -X GET "http://localhost:8000/api/v1/mirrors" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "mirrors": [
    {
      "id": "mirror_1",
      "url": "https://fitgirl-repacks.site",
      "name": "FitGirl Repacks",
      "location": "EU",
      "latency_ms": 120,
      "is_healthy": true,
      "weight": 10,
      "last_checked": "2024-01-15T10:55:00Z"
    },
    {
      "id": "mirror_2",
      "url": "https://elamigos.site",
      "name": "ElAmigos",
      "location": "EU",
      "latency_ms": 150,
      "is_healthy": true,
      "weight": 8,
      "last_checked": "2024-01-15T10:55:00Z"
    }
  ],
  "selected_mirror": null
}
```

### Check Mirror Health

```bash
curl -X GET "http://localhost:8000/api/v1/mirrors/mirror_1/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "mirror_id": "mirror_1",
  "is_healthy": true,
  "latency_ms": 120,
  "response_time": "2024-01-15T11:00:00Z"
}
```

### Select Preferred Mirror

```bash
curl -X POST "http://localhost:8000/api/v1/mirrors/select" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mirror_id": "mirror_1"
  }'
```

---

## Web Content Scraping

### Discover Patches

```bash
curl -X POST "http://localhost:8000/api/v1/scraper/discover" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "patch",
    "game": "Sims 4",
    "version": null,
    "sources": ["known_sites", "rss"],
    "use_cache": true
  }'
```

**Response:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "results": [
    {
      "id": "result_1",
      "title": "Sims 4 Patch 1.108.330",
      "url": "https://fitgirl-repacks.site/sims-4-patch-latest/",
      "snippet": "Latest game patch with bug fixes and improvements",
      "source": "known_sites",
      "content_type": "patch",
      "version": "1.108.330",
      "priority": 9,
      "trust_score": 95,
      "is_safe": true,
      "discovered_at": "2024-01-15T11:05:00Z",
      "mirrors": [
        "https://example.com/mirror1",
        "https://example.com/mirror2"
      ],
      "metadata": {}
    }
  ],
  "total_found": 1,
  "sources_used": ["known_sites", "rss"],
  "cache_hit": false,
  "discovered_at": "2024-01-15T11:05:00Z"
}
```

### Discover DLCs

```bash
curl -X POST "http://localhost:8000/api/v1/scraper/discover" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "dlc",
    "game": "Sims 4",
    "sources": ["known_sites", "rss"],
    "use_cache": true
  }'
```

### Validate URL

```bash
curl -X POST "http://localhost:8000/api/v1/scraper/validate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fitgirl-repacks.site/sims-4-patch-latest/",
    "content_type": "patch"
  }'
```

**Response:**
```json
{
  "url": "https://fitgirl-repacks.site/sims-4-patch-latest/",
  "is_safe": true,
  "trust_score": 95,
  "warnings": [],
  "domain": "fitgirl-repacks.site",
  "is_trusted": true
}
```

### Clear Scraper Cache

```bash
curl -X POST "http://localhost:8000/api/v1/scraper/cache/clear" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## DLC Unlocker

### Get Unlocker Status

```bash
curl -X GET "http://localhost:8000/api/v1/unlocker/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "installed": false,
  "client": null,
  "config_exists": false,
  "sims4_config_exists": false,
  "version_dll_exists": false
}
```

### Detect EA App/Origin

```bash
curl -X POST "http://localhost:8000/api/v1/unlocker/detect" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "client": "ea_app",
  "path": "C:\\Program Files\\EA Games\\EA App",
  "version": "12.0.0",
  "is_running": false
}
```

### Install DLC Unlocker

```bash
curl -X POST "http://localhost:8000/api/v1/unlocker/install" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "DLC Unlocker installed successfully",
  "client_used": "ea_app",
  "installation_time": 15.5
}
```

### Uninstall DLC Unlocker

```bash
curl -X POST "http://localhost:8000/api/v1/unlocker/uninstall" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "DLC Unlocker uninstalled successfully",
  "cleanup_time": 5.2
}
```

---

## Application Settings

### Get Settings

```bash
curl -X GET "http://localhost:8000/api/v1/settings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "game_directory": "C:\\Program Files\\EA Games\\The Sims 4",
  "manifest_url": "https://example.com/manifest.json",
  "preferred_mirror": null,
  "auto_check_updates": true,
  "check_interval_hours": 24,
  "enable_notifications": true,
  "language": "en",
  "theme": "dark"
}
```

### Update Settings

```bash
curl -X PATCH "http://localhost:8000/api/v1/settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "light",
    "language": "es",
    "check_interval_hours": 12
  }'
```

### Set Game Directory

```bash
curl -X POST "http://localhost:8000/api/v1/settings/game-dir" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "C:\\Program Files\\EA Games\\The Sims 4"
  }'
```

### Set Manifest URL

```bash
curl -X POST "http://localhost:8000/api/v1/settings/manifest-url" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "manifest_url": "https://example.com/manifest.json"
  }'
```

---

## Health & Diagnostics

### Health Check

```bash
curl -X GET "http://localhost:8000/health"
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3600.5,
  "timestamp": "2024-01-15T11:10:00Z"
}
```

### Get Server Statistics

```bash
curl -X GET "http://localhost:8000/api/v1/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "active_connections": 5,
  "total_requests": 1250,
  "avg_response_time_ms": 45.2,
  "cache_size_mb": 1.5,
  "database_size_mb": 10.0,
  "uptime_seconds": 3600.5
}
```

### Get Configuration Status

```bash
curl -X GET "http://localhost:8000/api/v1/config-status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "game_directory_configured": true,
  "manifest_url_configured": true,
  "google_api_configured": false,
  "bing_api_configured": false,
  "virustotal_configured": false,
  "scraper_sources": {
    "google": false,
    "bing": false,
    "known_sites": true,
    "rss": true
  },
  "rate_limiting_enabled": true
}
```

---

## Python Client Example

```python
import requests
from requests.exceptions import RequestException

class SimsUpdaterClient:
    def __init__(self, base_url="http://localhost:8000", username=None, password=None):
        self.base_url = base_url
        self.token = None
        self.refresh_token = None

        if username and password:
            self.login(username, password)

    def login(self, username, password):
        """Login and get JWT tokens."""
        response = requests.post(
            f"{self.base_url}/api/v1/auth/login",
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["access_token"]
        self.refresh_token = data["refresh_token"]
        return data

    def _headers(self):
        """Get authorization headers."""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def get_game_status(self):
        """Get current game status."""
        response = requests.get(
            f"{self.base_url}/api/v1/game/status",
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()

    def list_dlcs(self):
        """List all DLCs."""
        response = requests.get(
            f"{self.base_url}/api/v1/dlc",
            headers=self._headers()
        )
        response.raise_for_status()
        return response.json()

    def discover_patches(self, sources=["known_sites", "rss"]):
        """Discover patches across web."""
        response = requests.post(
            f"{self.base_url}/api/v1/scraper/discover",
            headers=self._headers(),
            json={
                "content_type": "patch",
                "game": "Sims 4",
                "sources": sources,
                "use_cache": True
            }
        )
        response.raise_for_status()
        return response.json()

    def apply_update(self, version):
        """Apply game update."""
        response = requests.post(
            f"{self.base_url}/api/v1/updates/apply",
            headers=self._headers(),
            json={"target_version": version}
        )
        response.raise_for_status()
        return response.json()

# Example usage
if __name__ == "__main__":
    client = SimsUpdaterClient(username="gamerfan123", password="SecurePassword123!")

    # Get game status
    status = client.get_game_status()
    print(f"Game Version: {status['current_version']}")

    # List DLCs
    dlcs = client.list_dlcs()
    print(f"Installed DLCs: {dlcs['installed']}/{dlcs['total']}")

    # Discover patches
    patches = client.discover_patches()
    print(f"Found {len(patches['results'])} patches")
```

---

## JavaScript Client Example

```javascript
class SimsUpdaterClient {
  constructor(baseUrl = "http://localhost:8000") {
    this.baseUrl = baseUrl;
    this.token = null;
    this.refreshToken = null;
  }

  async login(username, password) {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    this.token = data.access_token;
    this.refreshToken = data.refresh_token;
    return data;
  }

  async getGameStatus() {
    return this._fetch(`/api/v1/game/status`);
  }

  async listDLCs() {
    return this._fetch(`/api/v1/dlc`);
  }

  async discoverPatches() {
    return this._fetch(`/api/v1/scraper/discover`, {
      method: "POST",
      body: {
        content_type: "patch",
        game: "Sims 4",
        sources: ["known_sites", "rss"],
        use_cache: true
      }
    });
  }

  async _fetch(endpoint, options = {}) {
    const { method = "GET", body } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
  }
}

// Example usage
async function main() {
  const client = new SimsUpdaterClient();
  await client.login("gamerfan123", "SecurePassword123!");

  const status = await client.getGameStatus();
  console.log(`Game Version: ${status.current_version}`);

  const dlcs = await client.listDLCs();
  console.log(`DLCs: ${dlcs.installed}/${dlcs.total}`);
}

main();
```

---

## Tips & Best Practices

1. **Always authenticate first** - Get JWT token before accessing protected endpoints
2. **Cache tokens** - Store tokens locally to avoid re-authentication
3. **Use refresh tokens** - Refresh access tokens before they expire
4. **Handle errors gracefully** - Check HTTP status codes and error responses
5. **Rate limit awareness** - Monitor `X-RateLimit-*` headers
6. **Use async operations** - Prefer async endpoints for long operations (updates, discovery)
7. **Validate user input** - API validates all inputs, but validate on client side too
8. **Log operations** - Enable logging for debugging and monitoring

