# IBS AI WORKFORCE — Agent Developer Guidelines

## Overview
**IBS AI Workforce** is an enterprise AI agency operating system developed for **IBS Digital**.
Tagline: *One Company. Thirty AI Specialists. Unlimited Possibilities.*

This workspace contains the complete production-minded implementation of the platform:
- Next.js 15 App Router Frontend (`apps/web`) with dark charcoal & electric blue theme.
- FastAPI Backend Service (`services/api`) under `/api/v1` with PostgreSQL & SQLite support.
- Python AI Worker & Orchestrator (`services/worker`) managing 30 specialist agents.
- Real integration adapters with strict gating for external/financial actions.
- Sandboxed project workspaces for software development (`workspaces/`).

---

## Architecture Standards

1. **Separation of Concerns**:
   - `apps/web`: Pure presentation, React Hook Form, TanStack Query, SSE listeners, zero secrets.
   - `services/api`: REST API, auth (Argon2/PBKDF2 + JWT), RBAC, database models, file storage, security gates.
   - `services/worker`: DAG orchestrator, agent execution runtime, tool handlers, QA loops.
2. **The 30 Agents**:
   - Exactly 30 registered agent profiles across 5 divisions (Executive Management, Tech & Software Dev, Digital Marketing, Creative Studio, Sales & Client Services).
   - Distinct system instructions, accepted inputs, expected outputs, tools, execution limits, and quality checklists for every agent.
   - All managed via the database and runtime engine.
3. **Safety & Approvals**:
   - Spending budget, live ad publishing, email dispatch, and production deployments REQUIRE owner approval.
   - Agents NEVER approve their own restricted actions.
4. **Data Isolation**:
   - Multi-tenant and workspace boundary isolation.
   - Memory scopes: Company, Department, Project, Client, Task.
5. **No Fake Operations**:
   - Integrations show unconfigured states when credentials are missing.
   - Test suites use clearly marked mock adapters.
