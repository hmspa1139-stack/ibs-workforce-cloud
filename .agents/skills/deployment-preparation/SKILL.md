---
name: deployment-preparation
description: Instructions for packaging, containerizing, configuring environment parameters, and running IBS AI Workforce in Windows and Linux/Docker environments.
---

# Deployment Preparation Skill

## Environments
1. **Windows Local Development**:
   - Run `scripts/run-windows.ps1` for automatic virtualenv creation, dependencies installation, database migrations, initial seeding, and launch.
   - Non-Docker mode uses FastAPI with SQLite/Postgres and Next.js frontend dev server.
2. **Docker Production Deployment**:
   - Multi-container architecture via `docker-compose.yml`:
     - `web`: Next.js production build (`node:20-alpine`)
     - `api`: FastAPI ASGI service (`python:3.12-slim`)
     - `worker`: Python AI orchestrator & queue worker
     - `db`: PostgreSQL 16
     - `redis`: Redis 7 alpine
3. **Configuration & Secrets**:
   - Comprehensive `.env.example` file documenting all environment variables.
