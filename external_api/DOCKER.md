# Docker Setup for FastAPI Will Builder API

This directory contains a complete Docker setup for the FastAPI application with both production and development configurations.

## Quick Start

### Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose V2+
- `.env` file configured (copy from `.env.example`)

### Development Mode (Recommended for Local Development)

```bash
# 1. Ensure .env file exists
cp .env.example .env
# Edit .env with your configuration

# 2. Start services
docker-compose up -d

# 3. View logs
docker-compose logs -f api

# 4. Access the API
open http://localhost:8000/docs
```

### Production Mode

```bash
# Build production image
docker build -f Dockerfile -t will-builder-api:latest .

# Run production container
docker run -d \
  --name will-builder-api \
  -p 8000:8000 \
  --env-file .env \
  will-builder-api:latest
```

## Docker Files Overview

### 1. `Dockerfile` (Production)

Multi-stage production build optimized for security and size.

**Features:**
- Multi-stage build (builder + runtime)
- Base: `python:3.11-slim`
- Non-root user `fastapi` (UID 1001)
- Virtual environment isolation
- Health check integrated
- Optimized layer caching

**Stages:**
1. **Builder:** Installs dependencies in virtual environment
2. **Runtime:** Copies virtual environment and application code

**Security:**
- Runs as non-root user (fastapi:fastapi, UID/GID 1001)
- Minimal base image
- No development dependencies in final image

### 2. `Dockerfile.dev` (Development)

Single-stage development build with hot-reload support.

**Features:**
- Hot-reload enabled (`--reload` flag)
- Volume mounting for live code updates
- Same base image as production
- Faster build times
- Non-root user for consistency

**Usage:**
```bash
docker build -f Dockerfile.dev -t will-builder-api:dev .
docker run -p 8000:8000 -v $(pwd):/app --env-file .env will-builder-api:dev
```

### 3. `docker-compose.yml`

Orchestrates services for local development.

**Services:**
- `api`: FastAPI application (Dockerfile.dev)
- `db`: PostgreSQL 16 (optional, for local database)

**Default Configuration:**
- Uses Neon cloud database from `.env`
- PostgreSQL service included but can be enabled for offline development

**To use local PostgreSQL:**
1. Uncomment the `db` service configuration
2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@db:5432/will_builder
   ```

### 4. `.dockerignore`

Optimizes build context by excluding unnecessary files.

**Excluded:**
- Python cache files (`__pycache__`, `*.pyc`)
- Virtual environments (`venv/`, `.venv/`)
- Environment files (`.env`, `.env.*`)
- Git files (`.git/`, `.gitignore`)
- Documentation and tests
- IDE configuration

## Common Commands

### Development

```bash
# Start all services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs (all services)
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a service
docker-compose restart api

# Execute command in running container
docker-compose exec api python -c "print('Hello from container')"

# Access container shell
docker-compose exec api bash
```

### Production

```bash
# Build image
docker build -f Dockerfile -t will-builder-api:latest .

# Build with custom tag
docker build -f Dockerfile -t will-builder-api:v1.0.0 .

# Run container
docker run -d \
  --name will-builder-api \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e CLERK_SECRET_KEY="your-key" \
  -e SECRET_KEY="your-secret" \
  will-builder-api:latest

# View logs
docker logs -f will-builder-api

# Stop container
docker stop will-builder-api

# Remove container
docker rm will-builder-api

# Inspect image
docker inspect will-builder-api:latest
```

### Maintenance

```bash
# Check image size
docker images will-builder-api

# View image layers
docker history will-builder-api:latest

# Clean up unused resources
docker system prune -a

# Remove all will-builder related containers and images
docker-compose down --rmi all -v
```

## Verification and Testing

### 1. Health Check

```bash
# After starting services
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-XX...",
#   "service": "will-builder-api",
#   "db": "connected"
# }
```

### 2. API Documentation

```bash
# Swagger UI
open http://localhost:8000/docs

# ReDoc
open http://localhost:8000/redoc
```

### 3. Database Connection Test

```bash
# Execute Python in container
docker-compose exec api python -c "
from database import test_db_connection
import asyncio
result = asyncio.run(test_db_connection())
print(f'Database: {\"Connected\" if result else \"Failed\"}')
"
```

### 4. Hot-Reload Test (Development)

```bash
# 1. Start development stack
docker-compose up -d

# 2. Watch logs
docker-compose logs -f api

# 3. Edit main.py (change version string or add comment)
# You should see uvicorn detect the change and reload automatically
```

### 5. Production Build Verification

```bash
# Build production image
docker build -f Dockerfile -t will-builder-api:test .

# Verify image size (should be < 400MB)
docker images will-builder-api:test

# Run container with test environment
docker run -d \
  --name api-test \
  -p 8001:8000 \
  --env-file .env \
  will-builder-api:test

# Test health endpoint
curl http://localhost:8001/health

# Cleanup
docker stop api-test && docker rm api-test
```

## Environment Variables

### Required Variables

```bash
# Application
SECRET_KEY=<generate-with: python -c "import secrets; print(secrets.token_urlsafe(32))">
HOST=0.0.0.0
PORT=8000

# Database (Neon cloud or local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Clerk Authentication
CLERK_SECRET_KEY=<your-clerk-secret>

# CORS (adjust for your frontend)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Optional Variables

```bash
DEBUG=false
LOG_LEVEL=INFO
DATABASE_ECHO=false
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
```

## Database Options

### Option 1: Neon Cloud (Default)

**Advantages:**
- Managed service (no setup required)
- Always available
- Automatic backups
- Scalable

**Configuration:**
```bash
# In .env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/will_builder?sslmode=require
```

### Option 2: Local PostgreSQL (via Docker Compose)

**Advantages:**
- Offline development
- Full control
- Free

**Configuration:**
```yaml
# In docker-compose.yml - uncomment db service
# Then in .env:
DATABASE_URL=postgresql://postgres:postgres@db:5432/will_builder
```

```bash
# Start with local database
docker-compose up -d

# Access PostgreSQL
docker-compose exec db psql -U postgres -d will_builder
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. .env file missing -> cp .env.example .env
# 2. Database connection failed -> verify DATABASE_URL
# 3. Port 8000 in use -> change port mapping in docker-compose.yml
```

### Database connection errors

```bash
# Verify database is accessible
docker-compose exec api python -c "
from sqlalchemy import create_engine
from config import settings
engine = create_engine(settings.DATABASE_URL)
try:
    with engine.connect() as conn:
        print('Database connection: OK')
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

### Hot-reload not working

```bash
# Ensure volume mounting is correct
docker-compose config

# Should show:
# volumes:
#   - .:/app

# Restart with rebuild
docker-compose down
docker-compose up -d --build
```

### Permission errors

```bash
# Fix file ownership (on Linux/Mac)
sudo chown -R $(id -u):$(id -g) .

# Check container user
docker-compose exec api whoami
# Should output: fastapi
```

### Image size too large

```bash
# Check image size
docker images will-builder-api

# If > 500MB, verify:
# 1. .dockerignore is present and working
# 2. No large files in context
# 3. Multi-stage build is used (production Dockerfile)

# Analyze layers
docker history will-builder-api:latest
```

## Security Best Practices

1. **Never commit `.env` file**
   - Added to `.gitignore`
   - Mount as read-only volume: `./.env:/app/.env:ro`

2. **Use non-root user**
   - Application runs as `fastapi` user (UID 1001)
   - Prevents privilege escalation

3. **Minimal base image**
   - `python:3.11-slim` reduces attack surface
   - Multi-stage build removes build dependencies

4. **Health checks**
   - Docker monitors application health
   - Automatic restart on failure

5. **Environment variables**
   - Use external secrets management in production
   - Never hardcode credentials

## Performance Optimization

### Build Speed

```bash
# Use layer caching effectively
# - requirements.txt copied before code
# - Only rebuild when dependencies change

# Parallel builds (multi-core)
docker build --parallel -f Dockerfile .
```

### Runtime Performance

- Connection pooling configured in `database.py`
  - `pool_size=5`
  - `max_overflow=10`
- Virtual environment isolation
- Optimized Python imports

### Image Size

- Multi-stage build: ~250-350MB
- Single-stage dev: ~400-450MB
- Use `.dockerignore` to reduce context

## Integration with Frontend

### Same Docker Network

Create a root-level `docker-compose.yml` to run both services:

```yaml
# /Users/aboubakaryaheda/Development/Personal/will-builder/docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - EXTERNAL_API_URL=http://api:8000
    networks:
      - will-builder-network

  api:
    build: ./external_api
    ports:
      - "8000:8000"
    env_file:
      - ./external_api/.env
    networks:
      - will-builder-network

networks:
  will-builder-network:
    driver: bridge
```

### Usage

```bash
# Start entire stack
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: |
          cd external_api
          docker build -f Dockerfile -t will-builder-api:${{ github.sha }} .

      - name: Test image
        run: |
          docker run -d --name test-api -p 8000:8000 \
            -e DATABASE_URL="${{ secrets.DATABASE_URL }}" \
            -e CLERK_SECRET_KEY="${{ secrets.CLERK_SECRET_KEY }}" \
            will-builder-api:${{ github.sha }}

          sleep 10
          curl -f http://localhost:8000/health || exit 1
          docker stop test-api
```

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Python Docker Images](https://hub.docker.com/_/python)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f api`
2. Verify configuration: `docker-compose config`
3. Review this documentation
4. Check application logs in container: `docker-compose exec api cat app.log`
