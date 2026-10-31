---
name: backend-development
description: Procedures for developing FastAPI REST APIs, schemas, services, and asynchronous database interactions in IBS AI Workforce.
---

# Backend Development Skill

## Standards
- Framework: FastAPI with async/await handlers and Pydantic v2 schemas.
- Route prefix: All REST endpoints mounted under `/api/v1`.
- Authentication: JWT Bearer tokens with secure password hashing.
- Database: SQLAlchemy 2 async engine supporting PostgreSQL and SQLite for flexible deployment.
- Error handling: Uniform RFC 7807 problem details or structured error responses.

## Key Services
- `services/api/app/services/orchestration.py`: CEO plan coordination and task queue dispatch.
- `services/api/app/services/memory.py`: Multi-tier persistent memory retrieval and storage.
- `services/api/app/services/approvals.py`: Human approval gate enforcement.
