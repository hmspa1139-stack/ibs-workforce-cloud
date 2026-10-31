---
description: Enterprise architecture and code quality standards for IBS AI Workforce
always_on: true
---

# Architecture Rules

- Maintain strict decoupling between Frontend (`apps/web`), Backend API (`services/api`), and Worker (`services/worker`).
- All timestamps stored in database must be UTC, with Asia/Karachi as the default user display timezone.
- Never write credentials, private keys, or API tokens into source files, git commits, or frontend bundles.
- Use asynchronous SQLAlchemy 2 sessions and Pydantic v2 schemas for all API payloads.
- Ensure all database tables use UUID primary keys and maintain `created_at` and `updated_at` timestamps.
- When creating or modifying project files in software workspaces, isolate changes to `workspaces/<project_id>/`.
