# Sims 4 Updater REST API

Complete REST API for The Sims 4 Updater with authentication, DLC management, web scraping, and real-time updates.

## Features

✅ **Complete CRUD Operations**
- Game status and version management
- DLC listing, status, and dependency resolution
- Update verification, checking, and application
- Mirror discovery and health checking
- Web-wide content scraping
- DLC Unlocker installation/uninstallation
- User settings and preferences

✅ **Authentication & Security**
- JWT token-based authentication
- Refresh token support
- Bcrypt password hashing
- User registration and login
- Secure API endpoints

✅ **Auto-Generated Documentation**
- Interactive Swagger UI at `/docs`
- ReDoc documentation at `/redoc`
- OpenAPI schema at `/openapi.json`
- Type-safe request/response validation

✅ **Real-Time Updates** (Coming Soon)
- WebSocket support for live progress
- Download progress tracking
- DLC installation updates
- Scraper notifications

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements-api.txt

# Create .env file
cp .env.example .env
```

### Running the API

**Development Mode (with hot reload):**
```bash
python api_server.py
```

**Production Mode:**
```bash
pip install gunicorn

# Using Gunicorn
gunicorn api.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or using Uvicorn
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

**Docker:**
```bash
# Build
docker build -t sims4-updater-api .

# Run
docker run -p 8000:8000 sims4-updater-api
```

### Access the API

- **API**: http://localhost:8000/api/v1
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication

```
POST   /api/v1/auth/register         - Register new user
POST   /api/v1/auth/login            - Login (returns JWT tokens)
POST   /api/v1/auth/refresh          - Refresh access token
POST   /api/v1/auth/logout           - Logout
GET    /api/v1/auth/me               - Get current user info
```

### Game Management

```
GET    /api/v1/game/status           - Get game status
GET    /api/v1/game/versions         - List available versions
POST   /api/v1/game/discover-versions - Discover new versions
GET    /api/v1/game/manifest/{version} - Get manifest
```

### DLC Management

```
GET    /api/v1/dlc                   - List all DLCs
GET    /api/v1/dlc/{id}              - Get DLC details
GET    /api/v1/dlc/{id}/dependencies - Get dependencies
POST   /api/v1/dlc/resolve-dependencies - Resolve DLC dependencies
GET    /api/v1/dlc/status            - Scan installed DLCs
```

### Updates & Patches

```
POST   /api/v1/updates/verify        - Verify game integrity
POST   /api/v1/updates/check         - Check for updates
POST   /api/v1/updates/apply         - Apply patches
GET    /api/v1/updates/{id}          - Get update progress
DELETE /api/v1/updates/{id}          - Cancel update
GET    /api/v1/updates               - List recent updates
```

### Mirrors & Downloads

```
GET    /api/v1/mirrors               - List mirrors
POST   /api/v1/mirrors/discover      - Discover mirrors
GET    /api/v1/mirrors/{id}/status   - Check mirror health
POST   /api/v1/mirrors/select        - Select preferred mirror
GET    /api/v1/mirrors/stats         - Get mirror statistics
```

### Web Scraper

```
POST   /api/v1/scraper/discover      - Discover patches/DLCs/mods
GET    /api/v1/scraper/results/{id}  - Get discovery results
POST   /api/v1/scraper/validate      - Validate discovered URL
POST   /api/v1/scraper/cache/clear   - Clear cache
GET    /api/v1/scraper/cache/stats   - Get cache statistics
```

### DLC Unlocker

```
GET    /api/v1/unlocker/status       - Get unlocker status
POST   /api/v1/unlocker/detect       - Detect EA App/Origin
POST   /api/v1/unlocker/install      - Install DLC Unlocker
POST   /api/v1/unlocker/uninstall    - Uninstall DLC Unlocker
GET    /api/v1/unlocker/config       - Get unlocker config
```

### Settings

```
GET    /api/v1/settings              - Get settings
PATCH  /api/v1/settings              - Update settings
GET    /api/v1/settings/game-dir     - Get game directory
POST   /api/v1/settings/game-dir     - Set game directory
GET    /api/v1/settings/manifest-url - Get manifest URL
POST   /api/v1/settings/manifest-url - Set manifest URL
POST   /api/v1/settings/theme        - Set theme
POST   /api/v1/settings/language     - Set language
POST   /api/v1/settings/reset        - Reset settings
```

### Health & Diagnostics

```
GET    /health                       - Health check
GET    /api/v1/health                - API health check
GET    /api/v1/stats                 - Server statistics
GET    /api/v1/config-status         - Configuration status
GET    /ready                        - Readiness check (for K8s)
GET    /version                      - API version
GET    /info                         - Server info
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Flow:

1. **Register**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "SecurePassword123"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "SecurePassword123"
     }'
   ```

3. **Use Token**
   ```bash
   curl -X GET "http://localhost:8000/api/v1/auth/me" \
     -H "Authorization: Bearer <your_access_token>"
   ```

4. **Refresh Token**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/refresh" \
     -H "Content-Type: application/json" \
     -d '{"refresh_token": "<your_refresh_token>"}'
   ```

## Configuration

Environment variables (create `.env` file):

```env
# API Server
ENVIRONMENT=development
API_HOST=127.0.0.1
API_PORT=8000
API_SECRET_KEY=your-secret-key-here

# Game Settings
GAME_DIRECTORY=C:\Program Files\EA Games\The Sims 4
MANIFEST_URL=https://example.com/manifest.json

# Web Scraper
SCRAPER_ENABLE_GOOGLE=false
SCRAPER_ENABLE_BING=false
SCRAPER_ENABLE_KNOWN_SITES=true
SCRAPER_ENABLE_RSS=true
SCRAPER_CACHE_TTL_HOURS=24

# Optional APIs
GOOGLE_API_KEY=your-google-key
GOOGLE_CSE_ID=your-cse-id
BING_API_KEY=your-bing-key
VIRUSTOTAL_API_KEY=your-virustotal-key

# Logging
LOG_LEVEL=INFO
```

## Examples

### Get Game Status

```bash
curl -X GET "http://localhost:8000/api/v1/game/status" \
  -H "Authorization: Bearer <token>"
```

### List DLCs

```bash
curl -X GET "http://localhost:8000/api/v1/dlc" \
  -H "Authorization: Bearer <token>"
```

### Discover Patches

```bash
curl -X POST "http://localhost:8000/api/v1/scraper/discover" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "patch",
    "game": "Sims 4",
    "sources": ["known_sites", "rss"],
    "use_cache": true
  }'
```

### Apply Game Update

```bash
curl -X POST "http://localhost:8000/api/v1/updates/apply" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "target_version": "1.108.330",
    "selected_dlcs": ["EP01", "SP01"]
  }'
```

## Docker Support

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements-api.txt .
RUN pip install --no-cache-dir -r requirements-api.txt

COPY . .

EXPOSE 8000

CMD ["python", "api_server.py"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      ENVIRONMENT: production
      API_HOST: 0.0.0.0
      API_PORT: 8000
    volumes:
      - ./data:/app/data
```

## Error Handling

The API returns standard HTTP status codes:

- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict
- **422** - Validation Error
- **500** - Internal Server Error

Error responses follow this format:

```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "status_code": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Testing

### Manual Testing with Curl

```bash
# Check health
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"testpass123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"testpass123"}'
```

### Using Postman

Import the OpenAPI schema into Postman:
1. Go to "Import" > "Link"
2. Enter: `http://localhost:8000/openapi.json`

## Rate Limiting

Rate limiting is configured per endpoint:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705322400
```

Configure in `.env`:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD_SECONDS=60
```

## CORS

CORS is enabled for local development. Configure origins in `.env`:

```env
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

## Logging

Logs are output to console and optionally to file:

```env
LOG_LEVEL=INFO
LOG_FILE=/var/log/sims4-updater-api.log
```

## Performance

- **Async**: All endpoints are async for high performance
- **Caching**: Built-in caching for scraper results
- **Connection pooling**: Efficient database connections
- **Compression**: GZIP compression for responses

## Security

- JWT authentication with refresh tokens
- Bcrypt password hashing
- CORS protection
- Input validation with Pydantic
- Rate limiting
- HTTPS ready (use reverse proxy in production)

## API Documentation

Comprehensive auto-generated docs available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
API_PORT=8001

# Or kill process
lsof -ti:8000 | xargs kill -9
```

### Authentication Issues

- Ensure token is in `Authorization: Bearer <token>` format
- Check token expiration (default 30 minutes)
- Use refresh endpoint to get new access token

### Cors Errors

Update `CORS_ORIGINS` in `.env` to include your frontend URL

## Contributing

To add new endpoints:

1. Create route file in `api/routes/`
2. Define Pydantic models in `api/models.py`
3. Include router in `api/routes/__init__.py`
4. Add to OpenAPI documentation

## License

MIT

## Support

For issues and feature requests, visit:
https://github.com/your-repo/sims4-updater

## Version History

- **1.0.0** - Initial release
  - Complete REST API with JWT authentication
  - All core endpoints implemented
  - Auto-generated documentation
  - Ready for production use
