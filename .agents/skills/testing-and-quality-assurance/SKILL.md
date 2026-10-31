---
name: testing-and-quality-assurance
description: Testing guidelines covering unit, integration, DAG orchestration, and Playwright end-to-end tests.
---

# Testing and Quality Assurance Skill

## Testing Hierarchy
1. **Backend Unit & Integration Tests (`pytest`)**:
   - Authentication, user management, and workspace isolation.
   - 30 Agent registry verification and detail queries.
   - CEO DAG task decomposition and dependency resolution.
   - Approval gate intercept and resolution tests.
2. **AI Engine Tests**:
   - Validation that independent tasks run concurrently and dependent tasks execute in sequence.
   - QA review workflow tests.
3. **Frontend & E2E Tests**:
   - Playwright test flows for Owner setup, Login, CEO Chat, Task Board, and Approval flows.
