# Docker Setup Guide

This guide explains how to run your Helpdesk application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Project Structure

```
project/
├── backend/
│   ├── Dockerfile          # Backend container configuration
│   ├── .dockerignore       # Files to exclude from Docker build
│   ├── db.json             # JSON database
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   └── helpdesk-frontend/
│       ├── Dockerfile      # Frontend container configuration
│       ├── nginx.conf      # Nginx configuration
│       ├── .dockerignore   # Files to exclude from Docker build
│       └── package.json
└── docker-compose.yml      # Orchestrates all services
```

## Building and Running

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Build Images Manually

**Backend:**
```bash
docker build -t helpdesk-backend ./backend
docker run -p 3000:3000 --name helpdesk-backend helpdesk-backend
```

**Frontend:**
```bash
docker build -t helpdesk-frontend ./frontend/helpdesk-frontend
docker run -p 80:80 --name helpdesk-frontend helpdesk-frontend
```

## Accessing the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000

## Architecture

### Frontend Container
- **Base Image**: nginx:alpine
- **Port**: 80
- **Purpose**: Serves the built Angular application
- **Features**:
  - Multi-stage build (smaller final image)
  - Nginx configuration for SPA routing
  - API proxy to backend service
  - Gzip compression enabled
  - Static asset caching

### Backend Container
- **Base Image**: node:20-alpine
- **Port**: 3000
- **Purpose**: Runs the Express/JSON Server
- **Features**:
  - Minimal image size (alpine)
  - Production dependencies only
  - Persistent database volume

### Network
- **Name**: helpdesk-network
- **Type**: Bridge network
- **Purpose**: Enables communication between frontend and backend containers

## Configuration Details

### Nginx Configuration (nginx.conf)
The nginx.conf file includes:
- SPA routing (all routes redirect to index.html)
- API proxy to backend service (via docker service name)
- Gzip compression for performance
- Cache control headers
- Static asset caching (31536000 seconds = 1 year)

### Docker Compose Services
1. **backend**: Builds from `backend/Dockerfile`
   - Mounts `db.json` for data persistence
   - Exposed on port 3000
   - Part of helpdesk-network

2. **frontend**: Builds from `frontend/helpdesk-frontend/Dockerfile`
   - Depends on backend service
   - Exposed on port 80
   - Configured to proxy API requests to backend

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-name>

# Access container shell
docker exec -it <container-name> sh

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Build without cache
docker-compose up --build --no-cache

# Stop and remove everything
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
If port 80 or 3000 is already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Maps host port 8080 to container port 80
```

### Frontend Can't Connect to Backend
- Verify both services are running: `docker-compose ps`
- Check nginx.conf proxy_pass is set to `http://backend:3000`
- Ensure frontend environment is correctly configured

### Database Not Persisting
- The `db.json` is mounted as a volume in docker-compose.yml
- Check that the file has write permissions
- Verify the path in the mount: `./backend/db.json:/app/db.json`

### Clear Everything and Rebuild
```bash
docker-compose down -v
docker-compose up --build --no-cache
```

## Production Deployment

For production:
1. Build images without docker-compose
2. Push to a registry (Docker Hub, ECR, etc.)
3. Use proper environment variables
4. Consider using Kubernetes or Docker Swarm for orchestration
5. Add HTTPS/SSL support
6. Use healthchecks in docker-compose.yml

Example healthcheck addition:
```yaml
backend:
  healthcheck:
    test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
    interval: 10s
    timeout: 5s
    retries: 5
```

## Additional Notes

- The frontend Dockerfile uses a multi-stage build to minimize the final image size
- Alpine images are used for both Node.js and Nginx to keep images lightweight
- The backend uses `npm ci` for reproducible installations (instead of `npm install`)
- Database persistence is achieved through volume mounting
