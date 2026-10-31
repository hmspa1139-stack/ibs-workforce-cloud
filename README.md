# IBS AI WORKFORCE

> **One Company. Thirty AI Specialists. Unlimited Possibilities.**  
> *Autonomous Digital Agency Operating System — IBS Digital*  
> **Native Vercel Cloud & Supabase Architecture**

---

## 1. Executive Summary

**IBS AI Workforce** is an enterprise-grade AI agency operating system designed to run a modern digital technology and marketing agency using **exactly 30 specialized AI agents** coordinated by a central **AI CEO / Chief of Staff** (`agent_ceo`).

The platform runs as a **fully browser-based cloud application deployed on Vercel**, backed by **Supabase** (PostgreSQL, Auth, Storage, RLS) and the **Vercel AI SDK** with **Google Gemini** as the primary intelligence engine.

As Founder and Owner, you interact with one central command center. The AI CEO:
1. Deconstructs natural-language business goals into actionable Directed Acyclic Graphs (DAGs).
2. Deploys appropriate specialists across **5 core corporate divisions**.
3. Runs independent tasks in parallel and dependent tasks in sequence.
4. Generates real software code, design specifications, and marketing campaigns in isolated project workspaces with instant ZIP export.
5. Gates sensitive financial and external actions (ad spend, external email dispatch, live deployments) through the **Human Approval Center**.
6. Enforces independent code and deliverable audits via `agent_qa_engineer` before final acceptance.
7. Stores persistent deliverables and multi-tier memory scopes (Company, Department, Project, Client, Task history).

---

## 2. Cloud Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL SERVERLESS CLOUD                         │
│                                                                        │
│   Next.js 14/15 App Router Frontend (apps/web)                         │
│   ├─ 15 Responsive Dashboard Modules                                   │
│   ├─ Tailwind CSS (Dark Charcoal & Electric Blue Theme)                │
│   └─ Server-Sent Events (SSE) Live Task Activity Stream                │
│                                                                        │
│   Next.js Route Handlers (apps/web/app/api/*)                          │
│   ├─ /api/ceo/chat        ──> Vercel AI SDK (Google Gemini)           │
│   ├─ /api/agents/*        ──> 30 Specialist Profiles & Sandbox Test    │
│   ├─ /api/projects/*      ──> Workspace File Bundler (ZIP Export)      │
│   ├─ /api/tasks/*         ──> 8-Stage Kanban Execution Engine          │
│   └─ /api/approvals/*     ──> Strict Security & Spending Gates         │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
                   ▼                               ▼
      ┌─────────────────────────┐     ┌─────────────────────────┐
      │     SUPABASE CLOUD      │     │    GOOGLE GEMINI API    │
      │                         │     │                         │
      │ ├─ PostgreSQL (13 tbls) │     │ ├─ gemini-flash-lite    │
      │ ├─ Supabase Auth        │     │ ├─ gemini-flash-latest  │
      │ ├─ Storage Buckets      │     │ └─ gemini-pro-latest    │
      │ └─ Row Level Security   │     └─────────────────────────┘
      └─────────────────────────┘
```

---

## 3. The 5 Corporate Divisions & 30 AI Specialists

### A. IBS Executive Management
- **`agent_ceo` (Alex Vance)** — AI CEO & Chief of Staff: Central strategic orchestrator, task planner & executive deliverable synthesizer.
- **`agent_coo` (Elena Rostova)** — AI Chief Operating Officer: Workload balancing, bottleneck resolution & operational throughput.
- **`agent_project_manager` (Marcus Sterling)** — AI Senior Project Manager: Sprint milestone scheduling, task board management & dependency mapping.
- **`agent_strategy_research` (Dr. Aris Thorne)** — Strategy & Research Director: Competitor teardowns, industry benchmarking & strategic whitepapers.

### B. IBS Technology
- **`agent_product_manager` (Sophia Chen)** — Product Manager: Product roadmaps, feature matrices, user stories & comprehensive PRDs.
- **`agent_business_analyst` (Nadia Patel)** — Lead Business Analyst: Process modeling, functional requirement specs & domain entity models.
- **`agent_ux_researcher` (Liam O'Connor)** — Senior UX Researcher: Heuristic usability evaluations, navigation trees & user journeys.
- **`agent_uiux_designer` (Maya Lin)** — Principal UI/UX Designer: Tailwind design tokens, responsive layout specs & component blueprints.
- **`agent_frontend_developer` (Devon Miller)** — Senior Frontend Developer: Next.js 14/15, React, TypeScript & responsive UI components.
- **`agent_backend_developer` (Tarek Mansour)** — Senior Backend Developer: FastAPI async endpoints, REST schemas, JWT auth & business logic.
- **`agent_fullstack_developer` (Jordan Reed)** — Lead Full-Stack Developer: Turnkey web applications, full-stack state wiring & database bindings.
- **`agent_mobile_developer` (Gabriel Santos)** — Senior Mobile App Developer: Cross-platform iOS/Android apps, offline sync & navigation.
- **`agent_database_engineer` (Dmitri Volkov)** — Principal Database Engineer: PostgreSQL schemas, foreign keys, composite indexes & migrations.
- **`agent_qa_engineer` (Sarah Jenkins)** — Lead QA & Testing Engineer: Independent functional verification, unit tests & quality gating.
- **`agent_devops_engineer` (Aiden Cross)** — DevOps & Release Engineer: Multi-stage Dockerfiles, Docker Compose, CI/CD pipelines & proxies.
- **`agent_security_engineer` (Victor Drake)** — Cybersecurity Engineer: OWASP Top 10 audits, input sanitization, JWT security & secret protection.

### C. IBS Digital Marketing
- **`agent_marketing_director` (Chloe Dupont)** — Director of Digital Marketing: Omnichannel acquisition funnels & campaign blueprints.
- **`agent_seo_specialist` (Oliver Vance)** — Principal SEO Specialist: Keyword matrices, technical Core Web Vitals audits & JSON-LD schema.
- **`agent_meta_ads` (Jessica Taylor)** — Meta Ads Specialist: Facebook/Instagram direct-response ad sets & copy (Approval Gated).
- **`agent_google_ads` (Adam Fischer)** — Google Ads Specialist: Google Search, Performance Max & negative keyword catalogs (Approval Gated).
- **`agent_social_media` (Zoe Kravitz)** — Social Media Manager: LinkedIn thought leadership, Instagram calendars & viral hooks.
- **`agent_content_copywriter` (Samuel Harris)** — Content Strategist & Copywriter: High-converting landing page copy, PAS email sequences & articles.
- **`agent_marketing_analytics` (Brendan Cole)** — Marketing Analytics Specialist: Honest attribution modeling, CAC/ROAS calculations & funnel metrics.

### D. IBS Creative Studio
- **`agent_brand_designer` (Camila Silva)** — Brand Identity Designer: Corporate visual guidelines, color psychology & typographic hierarchies.
- **`agent_graphic_designer` (Lucas Morales)** — Senior Graphic Designer: Digital ad banners, visual templates & AI image prompts.
- **`agent_video_motion` (Nikolai Becker)** — Video & Motion Designer: Two-column commercial video scripts, storyboards & motion briefs.

### E. IBS Sales & Client Services
- **`agent_lead_generation` (Hannah Abbott)** — Lead Generation Specialist: Ideal Customer Profile (ICP) targeting & lawful prospect research.
- **`agent_sales_outreach` (Julian Vance)** — Sales & Outreach Agent: Personalized 4-step cold outreach sequences (Approval Gated).
- **`agent_proposal_pricing` (Grace Montgomery)** — Proposal & Pricing Specialist: Statements of Work (SOWs), transparent packages & milestones.
- **`agent_client_success` (Evelyn Reed)** — Senior Client Success Agent: Client onboarding welcome packets, status reports & retention audits.

---

## 4. Main Dashboard Navigation (15 Modules)

| Page | Route | Description |
|---|---|---|
| **Overview** | `/` | Executive KPIs, active tasks, daily AI token volume, and department stats. |
| **AI CEO Command Center** | `/ceo` | Natural language chat with the AI CEO, DAG plan inspector, and execution control. |
| **AI Workforce** | `/workforce` | Complete directory of 30 specialized agents, system prompt editors, and sandbox test runners. |
| **Departments** | `/departments` | 5 organizational divisions with workload metrics and specialist rosters. |
| **Projects** | `/projects` | Project manager with isolated workspace file browser and ZIP export. |
| **Task Management** | `/tasks` | 8-column Kanban board (Backlog to Completed) with priority filtering. |
| **Live Activity** | `/activity` | Real-time Server-Sent Events (SSE) stream of agent tool calls and events. |
| **Approval Center** | `/approvals` | Review and gate sensitive actions (budget spend, email sending, deployments). |
| **Files & Deliverables** | `/files` | Deliverables explorer with in-browser code viewer and file downloader. |
| **Clients** | `/clients` | Client CRM with contact records, associated projects, and isolated memory. |
| **Integrations** | `/integrations` | Authentic connection verification for Gemini, OpenAI, GitHub, Meta, Google Ads, etc. |
| **AI Usage & Costs** | `/usage` | Token graphs, estimated spend, and configurable budget safeguards. |
| **Reports & Analytics** | `/reports` | Company throughput, agent performance, and marketing attribution reports. |
| **Audit Logs** | `/audit` | Tamper-evident security and administrative audit trail. |
| **Settings** | `/settings` | Agency branding, active model provider, and display timezone (`Asia/Karachi`). |

---

## 5. Vercel Cloud Deployment Guide

Deploying IBS AI Workforce to Vercel takes less than 5 minutes:

### Step 1: Initialize Supabase Database
1. Log in to [Supabase](https://supabase.com/dashboard) and select your project.
2. Open the **SQL Editor** tab on the left sidebar.
3. Open `supabase/schema.sql` from this repository, copy its entire contents, and paste into the Supabase SQL editor.
4. Click **Run** to execute the script. This provisions all 13 tables, indexes, Row Level Security policies, and seeds all 5 core divisions and 30 specialist profiles.

### Step 2: Push to GitHub
1. Initialize git and commit your code (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: complete IBS AI Workforce for Vercel Cloud"
   ```
2. Create a private repository on GitHub (e.g. `ibs-ai-workforce`).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ibs-ai-workforce.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Import your GitHub repository `ibs-ai-workforce`.
3. In the project configuration:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
4. Expand **Environment Variables** and add the following keys:

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Cloud URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_publishable_key` | Supabase Publishable Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_key` | Supabase Secret Service Key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `your_google_gemini_api_key` | Google Gemini API Key |
| `GROQ_API_KEY` | `your_groq_api_key` | Groq LPU API Key |
| `OPENROUTER_API_KEY` | `your_openrouter_api_key` | OpenRouter API Key |
| `ACTIVE_AI_PROVIDER` | `gemini` | Primary AI Provider |
| `NEXT_PUBLIC_API_URL` | `/api` | Serverless route handler prefix |

5. Click **"Deploy"**. Vercel will build and deploy the Next.js App Router project in ~60 seconds.

---

## 6. Local Development Guide

To run the Next.js cloud frontend and API locally:

```bash
cd apps/web
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser. All API calls route directly to Next.js Route Handlers (`/api/*`) connected to Google Gemini and Supabase.

To build and verify the production bundle locally:
```bash
cd apps/web
npm run build
npm run start
```

---

*IBS Digital — One Company. Thirty AI Specialists. Unlimited Possibilities.*
