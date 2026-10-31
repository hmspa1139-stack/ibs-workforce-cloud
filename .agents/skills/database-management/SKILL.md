---
name: database-management
description: Procedures for managing PostgreSQL and SQLite schemas, migrations, seed operations, and multi-tenant isolation.
---

# Database Management Skill

## Standards
- Engine: SQLAlchemy 2 Async with PostgreSQL (`asyncpg`) and SQLite (`aiosqlite`).
- Primary Keys: UUIDv4 as standard string or native UUID representations.
- Auditing: All business models must include `created_at` and `updated_at` timestamps.
- Soft Delete: Critical models support `is_deleted` or `archived_at` flags.
- Seeding: The database seed script registers all 5 corporate departments and all 30 specialized agent configurations.
