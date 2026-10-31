---
name: frontend-development
description: Guidelines and procedures for developing responsive, high-performance UI views for the IBS AI Workforce Next.js 15 application.
---

# Frontend Development Skill

## Standards
- Framework: Next.js 15 App Router with TypeScript and Tailwind CSS.
- Styling Palette: Dark Charcoal (`#0B0F17`, `#111827`, `#0F172A`) with Electric Blue accents (`#0066FF`, `#3B82F6`, `#00D2FF`).
- UI Components: Accessible, responsive design with Lucide icons.
- State & Forms: TanStack Query for server caching, React Hook Form with Zod validation.
- Real-time updates: Server-Sent Events (SSE) listener hooks for live task and activity streaming.

## Procedures
1. Ensure all pages check for authentication and redirect to `/login` or `/setup` when not initialized.
2. Structure views under `apps/web/app/(dashboard)/` for consistent navigation and header layout.
3. Keep frontend client code completely decoupled from direct backend secrets.
