# REST API Deployment Guide

Complete guide for deploying the Sims 4 Updater REST API to production.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production with Nginx](#production-with-nginx)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Security Checklist](#security-checklist)

---

## Local Development

### Quick Start

```bash
# 1. Install dependencies
pip install -r requirements-api.txt

# 2. Create environment file
cp .env.api.example .env
# Edit .env with your settings

# 3. Run development server
python api_server.py
```

The API will be available at: http://localhost:8000

**Swagger UI**: http://localhost:8000/docs

---

## Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t sims4-updater-api:latest -f Dockerfile.api .

# Run container
docker run -d \
  --name sims4-api \
  -p 8000:8000 \
  -e GAME_DIRECTORY="/path/to/game" \
  -e MANIFEST_URL="https://example.com/manifest.json" \
  -e API_SECRET_KEY="your-secret-key" \
  sims4-updater-api:latest

# Check logs
docker logs -f sims4-api

# Stop container
docker stop sims4-api
```

### Using Docker Compose

```bash
# Start services
docker-compose -f docker-compose.api.yml up -d

# View logs
docker-compose -f docker-compose.api.yml logs -f

# Stop services
docker-compose -f docker-compose.api.yml down

# Rebuild image
docker-compose -f docker-compose.api.yml build --no-cache
```

---

## Production with Nginx

### 1. Install Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
```

### 2. Create Nginx Configuration

Create `/etc/nginx/sites-available/sims4-updater-api`:

```nginx
upstream sims4_api {
    # Use 4 workers for better performance
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
    server 127.0.0.1:8004;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name api.example.com;

    # SSL Certificate Configuration
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/sims4-api-access.log;
    error_log /var/log/nginx/sims4-api-error.log;

    # API Endpoints
    location /api/ {
        proxy_pass http://sims4_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Health Check
    location /health {
        proxy_pass http://sims4_api;
        access_log off;
    }

    # Documentation
    location /docs {
        proxy_pass http://sims4_api;
        proxy_set_header Host $host;
    }

    location /redoc {
        proxy_pass http://sims4_api;
        proxy_set_header Host $host;
    }

    # Root endpoint
    location / {
        proxy_pass http://sims4_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Enable Configuration

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/sims4-updater-api \
    /etc/nginx/sites-enabled/sims4-updater-api

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4. Get SSL Certificate

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.example.com

# Auto-renewal (automatic with Ubuntu)
sudo systemctl enable certbot.timer
```

### 5. Run API with Gunicorn

Create `/etc/systemd/system/sims4-api.service`:

```ini
[Unit]
Description=Sims 4 Updater REST API
After=network.target

[Service]
Type=notify
User=api
WorkingDirectory=/opt/sims4-updater-api
Environment="PATH=/opt/sims4-updater-api/venv/bin"
EnvironmentFile=/opt/sims4-updater-api/.env

# Run 4 worker processes on different ports
ExecStart=/opt/sims4-updater-api/venv/bin/gunicorn \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8001 \
    --bind 127.0.0.1:8002 \
    --bind 127.0.0.1:8003 \
    --bind 127.0.0.1:8004 \
    --access-logfile - \
    --error-logfile - \
    api.main:app

Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable on boot
sudo systemctl enable sims4-api

# Start service
sudo systemctl start sims4-api

# Check status
sudo systemctl status sims4-api

# View logs
sudo journalctl -u sims4-api -f
```

---

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace sims4-updater
```

### 2. Create ConfigMap for Configuration

```yaml
# config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: sims4-api-config
  namespace: sims4-updater
data:
  ENVIRONMENT: "production"
  LOG_LEVEL: "INFO"
  SCRAPER_ENABLE_KNOWN_SITES: "true"
  SCRAPER_ENABLE_RSS: "true"
```

Apply it:
```bash
kubectl apply -f config.yaml
```

### 3. Create Secret for Sensitive Data

```bash
kubectl create secret generic sims4-api-secrets \
  --from-literal=API_SECRET_KEY='your-secret-key' \
  --from-literal=GAME_DIRECTORY='/path/to/game' \
  --from-literal=MANIFEST_URL='https://example.com/manifest.json' \
  -n sims4-updater
```

### 4. Create Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sims4-api
  namespace: sims4-updater
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sims4-api
  template:
    metadata:
      labels:
        app: sims4-api
    spec:
      containers:
      - name: api
        image: sims4-updater-api:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http

        envFrom:
        - configMapRef:
            name: sims4-api-config
        - secretRef:
            name: sims4-api-secrets

        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10

        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

        # Resource limits
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 5. Create Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: sims4-api
  namespace: sims4-updater
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
    name: http
  selector:
    app: sims4-api
```

### 6. Create Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sims4-api
  namespace: sims4-updater
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.example.com
    secretName: sims4-api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sims4-api
            port:
              number: 80
```

### Deploy to Kubernetes

```bash
# Apply all configurations
kubectl apply -f config.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml

# Monitor deployment
kubectl get pods -n sims4-updater -w
kubectl logs -n sims4-updater -l app=sims4-api -f

# Check service
kubectl get svc -n sims4-updater
```

---

## Monitoring & Maintenance

### 1. Set Up Prometheus Monitoring

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sims4-api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

### 2. Logging with ELK Stack

```bash
# Docker Compose with ELK
docker-compose -f docker-compose.elk.yml up -d
```

### 3. Alerting Rules

```yaml
# rules.yaml
groups:
  - name: sims4_api
    rules:
      - alert: APIDown
        expr: up{job="sims4-api"} == 0
        for: 5m
        annotations:
          summary: "Sims 4 API is down"
```

### 4. Regular Maintenance

```bash
# Update dependencies
pip install --upgrade -r requirements-api.txt

# Check logs for errors
docker logs sims4-api

# Monitor disk usage
df -h

# Monitor memory
free -h

# Check API health
curl https://api.example.com/health
```

---

## Security Checklist

- [ ] Change `API_SECRET_KEY` from default value
- [ ] Enable HTTPS/SSL with valid certificate
- [ ] Configure CORS origins properly
- [ ] Set up rate limiting
- [ ] Enable authentication on all endpoints
- [ ] Use strong passwords for user accounts
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Log security events
- [ ] Set up backup strategy
- [ ] Test disaster recovery
- [ ] Document security procedures
- [ ] Regular penetration testing
- [ ] Enable audit logging

---

## Troubleshooting

### API Not Responding

```bash
# Check if container is running
docker ps | grep sims4-api

# Check logs
docker logs sims4-api

# Test connectivity
curl http://localhost:8000/health
```

### High CPU Usage

```bash
# Check process
ps aux | grep gunicorn

# Check memory
docker stats sims4-api

# Increase workers (modify service file and restart)
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nginx -t
```

### Database Connection Issues

```bash
# Check database
sqlite3 sims4_updater.db ".tables"

# Check permissions
ls -la sims4_updater.db

# Verify database path in .env
grep DATABASE_URL .env
```

---

## Performance Optimization

1. **Database**: Add indexes for frequently queried fields
2. **Caching**: Enable Redis for caching scraper results
3. **CDN**: Serve static files through CDN
4. **Compression**: Ensure GZIP compression is enabled
5. **Workers**: Adjust Gunicorn worker count (4-8 per CPU)

---

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/sims4-api"
DB_FILE="/app/sims4_updater.db"

mkdir -p $BACKUP_DIR
cp $DB_FILE $BACKUP_DIR/sims4_updater_$(date +%Y%m%d_%H%M%S).db

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Useful Commands

```bash
# View logs (Docker)
docker logs -f sims4-api --tail=100

# View logs (Systemd)
journalctl -u sims4-api -f

# Test API
curl -X GET http://localhost:8000/health

# Check database
sqlite3 sims4_updater.db "SELECT COUNT(*) FROM search_results;"

# Reload configuration (Nginx)
sudo nginx -s reload

# Restart service
sudo systemctl restart sims4-api
```

---

## Additional Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Gunicorn Documentation](https://gunicorn.org/)
- [Nginx Documentation](https://nginx.org/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## Support

For issues or questions:
1. Check logs for error messages
2. Verify configuration in `.env`
3. Test API health endpoint
4. Review API documentation at `/docs`

---

**Last Updated**: 2024-12-27
**Status**: Production Ready
