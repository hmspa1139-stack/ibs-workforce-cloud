---
description: Security and authorization rules for IBS AI Workforce
always_on: true
---

# Security Rules

- Enforce Role-Based Access Control (Owner, Admin, Staff, Client Viewer) across all protected routes.
- Password hashing must use secure modern algorithms (Argon2 / PBKDF2-HMAC-SHA256).
- All sensitive operations (ad spend, external email dispatch, live deployments, production DB modifications) MUST require human approval via the Approval Center.
- No agent may approve its own gated actions.
- Integration credentials must be encrypted at rest using AES-GCM or Fernet with server-side ENCRYPTION_KEY.
- Implement strict SSRF validation for any URL fetch or scraping tools.
