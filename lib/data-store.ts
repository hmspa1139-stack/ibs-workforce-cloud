// IBS AI Workforce — Cloud Data Store with Supabase Synchronization
import { AGENTS_REGISTRY, DEPARTMENTS } from "./agents-registry";

export interface ProjectData {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  priority: string;
  budget_limit_usd: number;
  total_spend_usd: number;
  completed_tasks: number;
  total_tasks: number;
  created_at: string;
  updated_at: string;
}

export interface TaskData {
  id: string;
  project_id: string;
  project_name?: string;
  assigned_agent_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  expected_output?: string;
  actual_output?: string;
  execution_cost_usd: number;
  tokens_used: number;
  duration_seconds: number;
  dependencies: string[];
  created_at: string;
  completed_at?: string;
}

export interface ClientData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  status: string;
  total_spend_usd: number;
  notes?: string;
  created_at: string;
  projects_count: number;
}

export interface ApprovalData {
  id: string;
  workspace_id: string;
  task_id?: string;
  project_id?: string;
  project_name?: string;
  requesting_agent_id: string;
  requesting_agent_name?: string;
  action_type: string;
  action_title: string;
  action_details: Record<string, any>;
  target_service: string;
  financial_impact_usd: number;
  risk_level: string;
  status: string;
  requested_at: string;
  decided_at?: string;
  rejection_reason?: string;
}

export interface DeliverableData {
  id: string;
  project_id: string;
  task_id?: string;
  created_by_agent_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  file_category: string;
  version: number;
  raw_content: string;
  created_at: string;
}

class CloudDataStore {
  ownerAccount = {
    id: "user_owner_001",
    email: "owner@ibsdigital.com",
    full_name: "Alex Vance (Founder & Owner)",
    role: "owner",
    is_active: true,
  };

  clients: ClientData[] = [
    {
      id: "cli_001",
      company_name: "Vanguard Apparel Inc.",
      contact_name: "Marcus Vance",
      email: "marcus@vanguardapparel.com",
      phone: "+1 (555) 234-8901",
      website: "https://vanguardapparel.com",
      industry: "E-Commerce / Fashion",
      status: "active",
      total_spend_usd: 14500.0,
      notes: "Direct-to-consumer fashion brand requiring full e-commerce migration and paid Meta acquisition.",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      projects_count: 1,
    },
    {
      id: "cli_002",
      company_name: "Apex Health Cloud",
      contact_name: "Dr. Sarah Lin",
      email: "sarah.lin@apexhealth.io",
      phone: "+1 (555) 789-0123",
      website: "https://apexhealth.io",
      industry: "Healthcare SaaS",
      status: "active",
      total_spend_usd: 28000.0,
      notes: "HIPAA-compliant telemedicine and patient scheduling portal architecture.",
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      projects_count: 1,
    },
    {
      id: "cli_003",
      company_name: "Nova Financial Group",
      contact_name: "David Sterling",
      email: "david@novafinancial.com",
      phone: "+1 (555) 456-7890",
      website: "https://novafinancial.com",
      industry: "Fintech / Wealth Management",
      status: "active",
      total_spend_usd: 19500.0,
      notes: "Wealth management portal re-branding and institutional investor lead generation.",
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
      projects_count: 1,
    },
  ];

  projects: ProjectData[] = [
    {
      id: "proj_001",
      name: "Vanguard E-Commerce Storefront & Payment Engine",
      slug: "vanguard-ecommerce-storefront",
      description: "High-conversion Next.js storefront with Stripe Checkout, product catalog schema, on-page SEO, and Meta ads.",
      status: "completed",
      priority: "high",
      budget_limit_usd: 45.0,
      total_spend_usd: 38.5,
      completed_tasks: 6,
      total_tasks: 6,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "proj_002",
      name: "Apex Health Patient Scheduling SaaS Portal",
      slug: "apex-health-patient-portal",
      description: "HIPAA-compliant patient booking portal with FastAPI microservice, calendar sync, and audit logging.",
      status: "active",
      priority: "urgent",
      budget_limit_usd: 60.0,
      total_spend_usd: 24.2,
      completed_tasks: 1,
      total_tasks: 4,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "proj_003",
      name: "Nova Financial Brand Re-launch & Institutional Leads",
      slug: "nova-financial-leads",
      description: "B2B client acquisition campaign targeting wealth managers and institutional accredited investors.",
      status: "planning",
      priority: "medium",
      budget_limit_usd: 35.0,
      total_spend_usd: 8.4,
      completed_tasks: 1,
      total_tasks: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  tasks: TaskData[] = [
    {
      id: "task_vanguard_1",
      project_id: "proj_001",
      project_name: "Vanguard E-Commerce Storefront",
      assigned_agent_id: "agent_business_analyst",
      title: "E-Commerce Functional Requirements Specification",
      description: "Scope out product catalog taxonomy, cart state, and Stripe webhooks.",
      status: "completed",
      priority: "high",
      expected_output: "Requirements Specification Document",
      actual_output: "# E-Commerce Requirements Document\n\n- Product catalog taxonomy\n- Cart session state\n- Stripe webhooks\n- Order confirmation email triggers",
      execution_cost_usd: 0.08,
      tokens_used: 1250,
      duration_seconds: 3.2,
      dependencies: [],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "task_vanguard_2",
      project_id: "proj_001",
      project_name: "Vanguard E-Commerce Storefront",
      assigned_agent_id: "agent_uiux_designer",
      title: "Storefront Component System & Mobile Wireframes",
      description: "Tailwind design system tokens, layout grid, and interactive cart drawer.",
      status: "completed",
      priority: "high",
      expected_output: "Tailwind Design System & Wireframes",
      actual_output: "// Storefront Design System Tokens\nexport const designTokens = {\n  colors: { primary: '#0066FF', charcoal: '#0B0F17' },\n  typography: { fontSans: 'Inter' }\n};",
      execution_cost_usd: 0.09,
      tokens_used: 1400,
      duration_seconds: 3.8,
      dependencies: ["task_vanguard_1"],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "task_vanguard_3",
      project_id: "proj_001",
      project_name: "Vanguard E-Commerce Storefront",
      assigned_agent_id: "agent_fullstack_developer",
      title: "Implement Storefront Web Application",
      description: "Develop responsive Next.js storefront with cart state and API integration.",
      status: "completed",
      priority: "high",
      expected_output: "Production Web Storefront Source Code",
      actual_output: "import React from 'react';\n\nexport default function Storefront() {\n  return (\n    <div className='p-8 bg-[#0B0F17] text-white'>\n      <h1 className='text-2xl font-bold'>Vanguard Apparel Store</h1>\n    </div>\n  );\n}",
      execution_cost_usd: 0.12,
      tokens_used: 1850,
      duration_seconds: 4.5,
      dependencies: ["task_vanguard_1", "task_vanguard_2"],
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "task_vanguard_4",
      project_id: "proj_001",
      project_name: "Vanguard E-Commerce Storefront",
      assigned_agent_id: "agent_qa_engineer",
      title: "Playwright E2E Verification & Deliverable Audit",
      description: "Execute functional test validation on storefront code and checkout links.",
      status: "completed",
      priority: "urgent",
      expected_output: "QA Verification Audit Certificate",
      actual_output: "# QA Verification Certificate\n\n- 24/24 Cart checkout test paths passed.\n- SSL & HTTPS endpoints verified.\n- Zero broken layout anchors detected.",
      execution_cost_usd: 0.06,
      tokens_used: 950,
      duration_seconds: 2.9,
      dependencies: ["task_vanguard_3"],
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: "task_apex_1",
      project_id: "proj_002",
      project_name: "Apex Health Patient Portal",
      assigned_agent_id: "agent_product_manager",
      title: "Patient Portal PRD & Role-Based Access Hierarchy",
      description: "Define user personas for Patient, Provider, and Clinic Admin with HIPAA logging.",
      status: "completed",
      priority: "high",
      expected_output: "Comprehensive PRD",
      actual_output: "# Apex Health PRD\n\nRoles: Patient, Provider, Clinic Admin.\nHIPAA audit logging mandatory on every PHI access.",
      execution_cost_usd: 0.08,
      tokens_used: 1300,
      duration_seconds: 3.4,
      dependencies: [],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "task_apex_2",
      project_id: "proj_002",
      project_name: "Apex Health Patient Portal",
      assigned_agent_id: "agent_backend_developer",
      title: "FastAPI Appointment Booking Endpoints & RBAC",
      description: "Implement appointments router with slot reservation and audit logging.",
      status: "in_progress",
      priority: "urgent",
      expected_output: "FastAPI Backend Modules",
      actual_output: "from fastapi import APIRouter\n\nrouter = APIRouter(prefix='/appointments')\n\n@router.post('/book')\nasync def book_appointment():\n    return {'status': 'confirmed'}",
      execution_cost_usd: 0.04,
      tokens_used: 800,
      duration_seconds: 2.1,
      dependencies: ["task_apex_1"],
      created_at: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: "task_apex_3",
      project_id: "proj_002",
      project_name: "Apex Health Patient Portal",
      assigned_agent_id: "agent_security_engineer",
      title: "OWASP Security Review & Data Encryption Audit",
      description: "Verify TLS 1.3, input sanitization, and PHI tokenization.",
      status: "quality_review",
      priority: "urgent",
      expected_output: "Security Audit Certificate",
      actual_output: "# Security Audit\n- Cryptographic tokens verified.\n- Zero SQL injection surface in parameterized queries.",
      execution_cost_usd: 0.05,
      tokens_used: 900,
      duration_seconds: 2.5,
      dependencies: ["task_apex_2"],
      created_at: new Date(Date.now() - 21600000).toISOString(),
    },
    {
      id: "task_apex_4",
      project_id: "proj_002",
      project_name: "Apex Health Patient Portal",
      assigned_agent_id: "agent_meta_ads",
      title: "Launch Clinic Acquisition Meta Campaign",
      description: "Allocate $25/day budget across Facebook & Instagram.",
      status: "waiting_approval",
      priority: "high",
      expected_output: "Meta Campaign Plan",
      actual_output: "Campaign drafted. Held for Owner approval in Approval Center.",
      execution_cost_usd: 0.03,
      tokens_used: 600,
      duration_seconds: 1.8,
      dependencies: ["task_apex_1"],
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  approvals: ApprovalData[] = [
    {
      id: "appr_001",
      workspace_id: "ws_default",
      task_id: "task_apex_4",
      project_id: "proj_002",
      project_name: "Apex Health Patient Portal",
      requesting_agent_id: "agent_meta_ads",
      requesting_agent_name: "Jessica Taylor (Meta Ads Specialist)",
      action_type: "ad_spend",
      action_title: "Approve Daily Budget Allocation: Meta Ads for Apex Health",
      action_details: { campaign: "Apex Health Launch", daily_budget_usd: 25.0, duration_days: 7 },
      target_service: "Meta Marketing API",
      financial_impact_usd: 175.0,
      risk_level: "high",
      status: "pending",
      requested_at: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: "appr_002",
      workspace_id: "ws_default",
      project_id: "proj_003",
      project_name: "Nova Financial Leads",
      requesting_agent_id: "agent_sales_outreach",
      requesting_agent_name: "Julian Vance (Sales & Outreach Agent)",
      action_type: "send_email",
      action_title: "Approve B2B Sales Cold Outreach Sequence to 20 Financial Advisors",
      action_details: { campaign: "Nova Institutional Leads", recipients_count: 20, sender: "outreach@ibsdigital.com" },
      target_service: "Google Workspace Gmail",
      financial_impact_usd: 0.0,
      risk_level: "medium",
      status: "pending",
      requested_at: new Date(Date.now() - 21600000).toISOString(),
    },
  ];

  deliverables: DeliverableData[] = [
    {
      id: "deliv_001",
      project_id: "proj_001",
      created_by_agent_id: "agent_fullstack_developer",
      file_name: "Storefront.tsx",
      file_path: "src/Storefront.tsx",
      file_size_bytes: 2840,
      mime_type: "text/typescript",
      file_category: "code",
      version: 1,
      raw_content: "import React from 'react';\n\nexport default function Storefront() {\n  return (\n    <div className='p-8 bg-[#0B0F17] text-white'>\n      <h1 className='text-2xl font-bold'>Vanguard Apparel Store</h1>\n    </div>\n  );\n}",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "deliv_002",
      project_id: "proj_001",
      created_by_agent_id: "agent_business_analyst",
      file_name: "prd_requirements.md",
      file_path: "docs/prd_requirements.md",
      file_size_bytes: 1820,
      mime_type: "text/markdown",
      file_category: "document",
      version: 1,
      raw_content: "# E-Commerce Requirements Document\n\n- Product catalog taxonomy\n- Cart session state\n- Stripe webhooks\n- Order confirmation email triggers",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "deliv_003",
      project_id: "proj_001",
      created_by_agent_id: "agent_qa_engineer",
      file_name: "qa_audit_certificate.md",
      file_path: "docs/qa_audit_certificate.md",
      file_size_bytes: 1450,
      mime_type: "text/markdown",
      file_category: "report",
      version: 1,
      raw_content: "# QA Verification Certificate\n\n- 24/24 Cart checkout test paths passed.\n- SSL & HTTPS endpoints verified.\n- Zero broken layout anchors detected.",
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  integrations = [
    { provider_key: "gemini", provider_name: "Google Gemini API (Primary)", description: "Official Google Gemini 2.5 Flash / Pro model runner for AI workforce.", is_enabled: true, is_connected: true, status_message: "Connected (Active Model: gemini-flash-lite-latest)", config: { provider: "gemini" } },
    { provider_key: "groq", provider_name: "Groq LPU Engine", description: "Ultra-low-latency Groq AI inference engine (GPT-OSS & Qwen).", is_enabled: true, is_connected: true, status_message: "Connected (Active Model: openai/gpt-oss-120b)", config: { provider: "groq" } },
    { provider_key: "openrouter", provider_name: "OpenRouter Multi-Model Gateway", description: "Universal LLM gateway routing to GPT-4o, Claude 3.5 Sonnet & Llama 3.", is_enabled: true, is_connected: true, status_message: "Configured (Active Model: openai/gpt-4o)", config: { provider: "openrouter" } },
    { provider_key: "ollama", provider_name: "Ollama Private LLM", description: "On-premise / private local AI model executor (Llama 3.2, Mistral).", is_enabled: true, is_connected: true, status_message: "Ready: http://localhost:11434", config: { provider: "ollama" } },
    { provider_key: "github", provider_name: "GitHub Repositories", description: "Code versioning, branch management, and repository synchronization.", is_enabled: true, is_connected: true, status_message: "Connected (User: hmspa1139-stack)", config: { username: "hmspa1139-stack" } },
    { provider_key: "gdrive", provider_name: "Google Drive", description: "Project documentation sync and deliverables archive.", is_enabled: false, is_connected: false, status_message: "Not Connected — Optional OAuth", config: {} },
    { provider_key: "gmail", provider_name: "Google Workspace Gmail", description: "Outreach email drafting (strictly gated for human approval).", is_enabled: false, is_connected: false, status_message: "Not Connected — Optional OAuth", config: {} },
    { provider_key: "meta_ads", provider_name: "Meta Marketing API", description: "Facebook & Instagram campaign management (strictly gated).", is_enabled: false, is_connected: false, status_message: "Not Connected — Configure Ad Account", config: {} },
    { provider_key: "google_ads", provider_name: "Google Ads API", description: "Google Search, Display & Performance Max management (strictly gated).", is_enabled: false, is_connected: false, status_message: "Not Connected — Configure Developer Token", config: {} },
    { provider_key: "web_research", provider_name: "Web Research Engine", description: "Public internet search, competitor intelligence, and source citation.", is_enabled: true, is_connected: true, status_message: "Active: Pluggable web research engine", config: {} },
    { provider_key: "playwright", provider_name: "Browser Automation (Playwright)", description: "Automated end-to-end web testing and screenshot auditing.", is_enabled: true, is_connected: true, status_message: "Active: Cloud sandbox test runner", config: {} },
    { provider_key: "image_generation", provider_name: "Image Generation Provider", description: "AI visual generation for marketing banners and ad creatives.", is_enabled: false, is_connected: false, status_message: "Not Connected — Optional image API", config: {} },
    { provider_key: "hosting", provider_name: "Vercel Cloud Deployment", description: "Native Vercel production and preview deployment management.", is_enabled: true, is_connected: true, status_message: "Active: Vercel Cloud Native", config: {} },
  ];

  settings: Record<string, string> = {
    company_name: "IBS Digital",
    tagline: "One Company. Thirty AI Specialists. Unlimited Possibilities.",
    default_ai_provider: "gemini",
    default_model: "gemini-flash-lite-latest",
    display_timezone: "Asia/Karachi",
    cost_limit_per_task: "5.00",
    daily_budget_limit_usd: "100.00",
    monthly_budget_limit_usd: "2000.00",
  };

  auditLogs = [
    { id: "aud_001", action: "system_cloud_boot", entity_type: "system", entity_id: "vercel_runtime", user_id: "system", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "aud_002", action: "owner_setup_verified", entity_type: "user", entity_id: "user_owner_001", user_id: "user_owner_001", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "aud_003", action: "project_provisioned", entity_type: "project", entity_id: "proj_001", user_id: "agent_ceo", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "aud_004", action: "approval_intercepted", entity_type: "approval", entity_id: "appr_001", user_id: "agent_meta_ads", created_at: new Date(Date.now() - 10800000).toISOString() },
  ];

  ceoMessages = [
    {
      id: "msg_init_1",
      sender_type: "user",
      sender_id: "owner",
      content: "Alex, initialize our digital marketing and software development workforce. I want full readiness across all 5 divisions.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      metadata: {},
    },
    {
      id: "msg_init_2",
      sender_type: "agent",
      sender_id: "agent_ceo",
      content: `Welcome, Founder. IBS AI Workforce is at 100% cloud operational readiness on Vercel.

### Operational Status:
- **30 Specialized AI Agents**: Activated across Executive, Technology, Digital Marketing, Creative Studio, and Sales divisions.
- **Supabase Cloud Database & Storage**: Synchronized with Row Level Security.
- **Safety & Approval Gates**: Active. All outbound ad spend and external email sequences are held in the Approval Center for your review.
- **Active Projects**: E-commerce, healthcare SaaS, and fintech lead generation pipelines initialized.

Type any objective into this Command Center, and I will synthesize the task DAG, assign specialists, coordinate dependencies, and deliver verified agency deliverables.`,
      created_at: new Date(Date.now() - 86400000 + 2000).toISOString(),
      metadata: {},
    },
  ];
}

// Global singleton instance for Next.js App Router
declare global {
  var __cloudDataStore: CloudDataStore | undefined;
}

export const cloudStore = globalThis.__cloudDataStore || new CloudDataStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.__cloudDataStore = cloudStore;
}
