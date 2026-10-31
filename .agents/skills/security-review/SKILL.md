---
name: security-review
description: Comprehensive security auditing, input sanitization, permission enforcement, and secret protection standards.
---

# Security Review Skill

## Checklist
1. **Authentication & Session Safety**: Validate password complexity, secure JWT issuance, and expiration handling.
2. **Access Control**: Verify user roles (`owner`, `admin`, `staff`, `viewer`) for every API endpoint.
3. **Approval Gating**: Ensure no sensitive operation executes without an approved record in `approvals`.
4. **Injection Prevention**: Use parameterized queries via SQLAlchemy and strict Pydantic input schemas.
5. **SSRF & Sandbox Defense**: Validate external URLs before fetching and isolate file execution inside project workspaces.
