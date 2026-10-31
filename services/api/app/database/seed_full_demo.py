import asyncio
import json
import os
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.config import hash_password
from app.models import (
    User, Workspace, Department, AgentProfile, Project,
    Task, TaskDependency, AgentRun, AgentRunEvent,
    Approval, Client, Deliverable, MemoryRecord,
    UsageRecord, AuditLog, Conversation, ConversationMessage
)
from app.services.file_workspace import WorkspaceFileSystem

DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"

async def seed_full_agency_ecosystem():
    """Seeds rich, realistic initial agency records across all 15 platform modules."""
    print("Seeding complete agency operational data...")
    
    async with AsyncSessionLocal() as session:
        # 1. Ensure Founder / Owner account exists
        owner_res = await session.execute(select(User).where(User.email == "owner@ibsdigital.com"))
        owner = owner_res.scalar_one_or_none()
        if not owner:
            owner = User(
                email="owner@ibsdigital.com",
                hashed_password=hash_password("Password123!"),
                full_name="Alex Vance (Founder & Owner)",
                role="owner",
                is_active=True,
                workspace_id=DEFAULT_WORKSPACE_ID,
                last_login_at=datetime.now(timezone.utc)
            )
            session.add(owner)
            await session.commit()
            await session.refresh(owner)
            print(f"Created Owner Account: {owner.email} (Password: Password123!)")

        # Update workspace owner_id
        ws_res = await session.execute(select(Workspace).where(Workspace.id == DEFAULT_WORKSPACE_ID))
        ws = ws_res.scalar_one_or_none()
        if ws and ws.owner_id != owner.id:
            ws.owner_id = owner.id
            await session.commit()

        # 2. Seed 4 Key Clients
        clients_data = [
            {
                "company_name": "Vanguard Apparel Inc.",
                "contact_name": "Marcus Vance",
                "email": "marcus@vanguardapparel.com",
                "phone": "+1 (555) 234-8901",
                "website": "https://vanguardapparel.com",
                "industry": "E-Commerce / Fashion",
                "address": "450 Fashion Ave, New York, NY",
                "total_spend_usd": 14500.0,
                "notes": "Premium direct-to-consumer fashion brand requiring full e-commerce migration and paid acquisition."
            },
            {
                "company_name": "Apex Health Cloud",
                "contact_name": "Dr. Sarah Lin",
                "email": "sarah.lin@apexhealth.io",
                "phone": "+1 (555) 789-0123",
                "website": "https://apexhealth.io",
                "industry": "Healthcare SaaS",
                "address": "1200 Innovation Way, Boston, MA",
                "total_spend_usd": 28000.0,
                "notes": "HIPAA-compliant telemedicine and patient scheduling portal architecture."
            },
            {
                "company_name": "Nova Financial Group",
                "contact_name": "David Sterling",
                "email": "david@novafinancial.com",
                "phone": "+1 (555) 456-7890",
                "website": "https://novafinancial.com",
                "industry": "Fintech / Wealth Management",
                "address": "100 Wall Street, New York, NY",
                "total_spend_usd": 19500.0,
                "notes": "Wealth management portal re-branding and institutional investor lead generation."
            },
            {
                "company_name": "Luxe Hospitality Global",
                "contact_name": "Elena Rostova",
                "email": "elena@luxeresorts.com",
                "phone": "+1 (555) 901-2345",
                "website": "https://luxeresorts.com",
                "industry": "Travel & Luxury Hospitality",
                "address": "780 Ocean Drive, Miami, FL",
                "total_spend_usd": 11200.0,
                "notes": "Direct booking engine optimization and Meta ad creative campaigns."
            }
        ]

        client_map = {}
        for c in clients_data:
            c_res = await session.execute(select(Client).where(Client.email == c["email"]))
            row = c_res.scalar_one_or_none()
            if not row:
                row = Client(
                    workspace_id=DEFAULT_WORKSPACE_ID,
                    company_name=c["company_name"],
                    contact_name=c["contact_name"],
                    email=c["email"],
                    phone=c["phone"],
                    website=c["website"],
                    industry=c["industry"],
                    address=c["address"],
                    status="active",
                    total_spend_usd=c["total_spend_usd"],
                    notes=c["notes"]
                )
                session.add(row)
                await session.flush()
            client_map[c["company_name"]] = row.id
        await session.commit()

        # 3. Seed 3 Active / Completed Projects with Workspaces
        projects_data = [
            {
                "name": "Vanguard E-Commerce Storefront & Payment Engine",
                "slug": "vanguard-ecommerce-storefront",
                "client": "Vanguard Apparel Inc.",
                "description": "High-conversion Next.js storefront with Stripe Checkout integration, product catalog schema, on-page SEO, and Meta ads.",
                "status": "completed",
                "priority": "high",
                "budget": 45.0,
                "spend": 38.50,
                "tasks": [
                    {"agent": "agent_business_analyst", "title": "E-Commerce Functional Requirements Specification", "status": "completed", "priority": "high", "output": "# E-Commerce Requirements Document\n\n- Product catalog taxonomy\n- Cart session state\n- Stripe webhooks\n- Order confirmation email triggers", "file": "docs/prd_requirements.md", "cat": "document"},
                    {"agent": "agent_uiux_designer", "title": "Storefront Component System & Mobile Wireframes", "status": "completed", "priority": "high", "output": "// Storefront Design System Tokens\nexport const designTokens = {\n  colors: { primary: '#0066FF', charcoal: '#0B0F17' },\n  typography: { fontSans: 'Inter' }\n};", "file": "src/design_tokens.ts", "cat": "code"},
                    {"agent": "agent_database_engineer", "title": "E-Commerce PostgreSQL DDL & Migration Schema", "status": "completed", "priority": "high", "output": "CREATE TABLE products (\n  id UUID PRIMARY KEY,\n  title VARCHAR(255) NOT NULL,\n  sku VARCHAR(50) UNIQUE NOT NULL,\n  price NUMERIC(10, 2) NOT NULL,\n  stock_count INTEGER DEFAULT 0\n);", "file": "db/schema_products.sql", "cat": "code"},
                    {"agent": "agent_fullstack_developer", "title": "Implement Next.js Storefront & Cart Application", "status": "completed", "priority": "high", "output": "import React from 'react';\n\nexport default function Storefront() {\n  return (\n    <div className='p-8 bg-[#0B0F17] text-white'>\n      <h1 className='text-2xl font-bold'>Vanguard Apparel Store</h1>\n    </div>\n  );\n}", "file": "src/Storefront.tsx", "cat": "code"},
                    {"agent": "agent_seo_specialist", "title": "E-Commerce On-Page SEO Matrix & Schema Markup", "status": "completed", "priority": "medium", "output": "{\n  \"@context\": \"https://schema.org/\",\n  \"@type\": \"Product\",\n  \"name\": \"Vanguard Signature Jacket\",\n  \"offers\": {\n    \"@type\": \"Offer\",\n    \"price\": \"189.00\",\n    \"priceCurrency\": \"USD\"\n  }\n}", "file": "marketing/product_schema.json", "cat": "report"},
                    {"agent": "agent_qa_engineer", "title": "Automated E2E Playwright Regression Verification", "status": "completed", "priority": "urgent", "output": "# QA Verification Certificate\n\n- 24/24 Cart checkout test paths passed.\n- SSL & HTTPS endpoints verified.\n- Zero broken layout anchors detected.", "file": "docs/qa_audit_certificate.md", "cat": "report"}
                ]
            },
            {
                "name": "Apex Health Patient Scheduling SaaS Portal",
                "slug": "apex-health-patient-portal",
                "client": "Apex Health Cloud",
                "description": "HIPAA-compliant patient booking portal with FastAPI microservice, calendar sync, and audit logging.",
                "status": "active",
                "priority": "urgent",
                "budget": 60.0,
                "spend": 24.20,
                "tasks": [
                    {"agent": "agent_product_manager", "title": "Patient Portal PRD & Role-Based Access Hierarchy", "status": "completed", "priority": "high", "output": "# Apex Health PRD\n\nRoles: Patient, Provider, Clinic Admin.\nHIPAA audit logging mandatory on every PHI access.", "file": "docs/patient_portal_prd.md", "cat": "document"},
                    {"agent": "agent_backend_developer", "title": "FastAPI Appointment Booking Endpoints & RBAC", "status": "in_progress", "priority": "urgent", "output": "from fastapi import APIRouter\n\nrouter = APIRouter(prefix='/appointments')\n\n@router.post('/book')\nasync def book_appointment():\n    return {'status': 'confirmed'}", "file": "api/appointments.py", "cat": "code"},
                    {"agent": "agent_security_engineer", "title": "OWASP Security Review & Data Encryption Audit", "status": "quality_review", "priority": "urgent", "output": "# Security Audit\n- Cryptographic tokens verified.\n- Zero SQL injection surface in parameterized queries.", "file": "docs/security_audit.md", "cat": "report"},
                    {"agent": "agent_meta_ads", "title": "Launch Clinic Acquisition Meta Campaign", "status": "waiting_approval", "priority": "high", "output": "Waiting for Owner Approval to allocate $25/day ad spend.", "file": "marketing/ad_campaign.json", "cat": "report"}
                ]
            },
            {
                "name": "Nova Financial Brand Re-launch & Institutional Leads",
                "slug": "nova-financial-leads",
                "client": "Nova Financial Group",
                "description": "B2B client acquisition campaign targeting wealth managers and institutional accredited investors.",
                "status": "planning",
                "priority": "medium",
                "budget": 35.0,
                "spend": 8.40,
                "tasks": [
                    {"agent": "agent_strategy_research", "title": "Wealth Management Competitor Intelligence Dossier", "status": "completed", "priority": "high", "output": "# Wealth Management Intelligence Report\nAnalysis of top 5 asset managers and private equity acquisition tactics.", "file": "docs/competitor_report.md", "cat": "document"},
                    {"agent": "agent_lead_generation", "title": "Curate Verified B2B Wealth Manager Prospect List", "status": "assigned", "priority": "high", "output": "Gathering verified public profiles of RIA decision-makers.", "file": "sales/prospect_list.csv", "cat": "report"},
                    {"agent": "agent_sales_outreach", "title": "Personalized 4-Step Cold Email Outreach Cadence", "status": "backlog", "priority": "medium", "output": "4-part value proposition sequence drafting in progress.", "file": "sales/email_cadence.md", "cat": "document"}
                ]
            }
        ]

        for p_data in projects_data:
            p_res = await session.execute(select(Project).where(Project.slug == p_data["slug"]))
            proj = p_res.scalar_one_or_none()
            cid = client_map.get(p_data["client"])

            if not proj:
                proj = Project(
                    workspace_id=DEFAULT_WORKSPACE_ID,
                    client_id=cid,
                    name=p_data["name"],
                    slug=p_data["slug"],
                    description=p_data["description"],
                    status=p_data["status"],
                    priority=p_data["priority"],
                    budget_limit_usd=p_data["budget"],
                    total_spend_usd=p_data["spend"]
                )
                session.add(proj)
                await session.flush()

                # Materialize files in isolated workspace
                fs = WorkspaceFileSystem(proj.id)
                proj.workspace_path = fs.root_path
                fs.write_file("README.md", f"# {proj.name}\n\n**Client:** {p_data['client']}\n\n{proj.description}\n")

                for t_item in p_data["tasks"]:
                    task = Task(
                        project_id=proj.id,
                        assigned_agent_id=t_item["agent"],
                        title=t_item["title"],
                        status=t_item["status"],
                        priority=t_item["priority"],
                        actual_output=t_item["output"],
                        execution_cost_usd=0.08,
                        tokens_used=1250,
                        duration_seconds=3.2,
                        completed_at=datetime.now(timezone.utc) if t_item["status"] == "completed" else None
                    )
                    session.add(task)
                    await session.flush()

                    # Write file into workspace
                    fs.write_file(t_item["file"], t_item["output"])
                    deliv = Deliverable(
                        project_id=proj.id,
                        task_id=task.id,
                        created_by_agent_id=t_item["agent"],
                        file_name=os.path.basename(t_item["file"]),
                        file_path=t_item["file"],
                        file_size_bytes=len(t_item["output"]),
                        mime_type="text/plain",
                        file_category=t_item["cat"],
                        version=1
                    )
                    session.add(deliv)

        await session.commit()

        # 4. Seed Human Approval Requests
        appr_res = await session.execute(select(Approval).limit(1))
        if not appr_res.scalar_one_or_none():
            appr1 = Approval(
                workspace_id=DEFAULT_WORKSPACE_ID,
                action_type="ad_spend",
                action_title="Approve Daily Budget Allocation: Meta Ads for Apex Health",
                action_details=json.dumps({"campaign": "Apex Health Launch", "daily_budget": 25.0, "duration_days": 7}),
                target_service="Meta Marketing API",
                financial_impact_usd=175.0,
                risk_level="high",
                status="pending",
                requesting_agent_id="agent_meta_ads",
                requested_at=datetime.now(timezone.utc)
            )
            session.add(appr1)

            appr2 = Approval(
                workspace_id=DEFAULT_WORKSPACE_ID,
                action_type="send_email",
                action_title="Approve B2B Sales Cold Outreach Sequence to 20 Financial Advisors",
                action_details=json.dumps({"campaign": "Nova Institutional Leads", "recipients_count": 20, "sender": "outreach@ibsdigital.com"}),
                target_service="Google Workspace Gmail",
                financial_impact_usd=0.0,
                risk_level="medium",
                status="pending",
                requesting_agent_id="agent_sales_outreach",
                requested_at=datetime.now(timezone.utc) - timedelta(hours=2)
            )
            session.add(appr2)
            await session.commit()

        # 5. Seed Memory Records Across 4 Scopes
        mem_res = await session.execute(select(MemoryRecord).limit(1))
        if not mem_res.scalar_one_or_none():
            memories = [
                ("company", None, "brand_guidelines", "IBS Digital Enterprise Aesthetic Standard", "Primary color is Electric Blue (#0066FF), Background is Dark Charcoal (#070A0F). All UI must remain sleek and high-contrast.", 10),
                ("company", None, "compliance_policy", "External Safety & Spending Protocol", "Never commit advertising budget or dispatch live external emails without human approval in the Approval Center.", 10),
                ("department", None, "tech_stack_doctrine", "Engineering Architecture Baseline", "Next.js 14/15 App Router, FastAPI backend, SQLAlchemy 2 async, Pydantic schemas, strict type-checking.", 9),
                ("department", None, "qa_acceptance_policy", "Uncompromising Quality Rule", "Never claim a deliverable passes tests without verifiable test runner execution logs.", 9)
            ]
            for scope, ent, key, title, content, imp in memories:
                m = MemoryRecord(
                    workspace_id=DEFAULT_WORKSPACE_ID,
                    scope=scope,
                    entity_id=ent,
                    key=key,
                    title=title,
                    content=content,
                    tags=json.dumps(["core", "governance"]),
                    importance_score=imp,
                    is_active=True
                )
                session.add(m)
            await session.commit()

        # 6. Seed Recent Audit Logs
        audit_res = await session.execute(select(AuditLog).limit(1))
        if not audit_res.scalar_one_or_none():
            audit_events = [
                ("system_boot", "system", "ibs_engine", "System initialized with 30 AI specialists and 5 divisions."),
                ("agent_registered", "agent", "agent_ceo", "AI CEO Chief of Staff Alex Vance initialized."),
                ("project_provisioned", "project", "vanguard-ecommerce", "Isolated workspace provisioned on disk."),
                ("approval_gate_intercept", "approval", "appr_meta_ads", "Meta Ads spend action gated for Owner approval.")
            ]
            for act, ent_type, ent_id, detail in audit_events:
                a = AuditLog(
                    workspace_id=DEFAULT_WORKSPACE_ID,
                    action=act,
                    entity_type=ent_type,
                    entity_id=ent_id,
                    user_id=owner.id,
                    details_json=json.dumps({"info": detail})
                )
                session.add(a)
            await session.commit()

        # 7. Seed Initial AI CEO Conversation
        conv_res = await session.execute(select(Conversation).where(Conversation.channel == "ceo_chat").limit(1))
        if not conv_res.scalar_one_or_none():
            conv = Conversation(
                workspace_id=DEFAULT_WORKSPACE_ID,
                user_id=owner.id,
                title="AI CEO Strategic Session",
                channel="ceo_chat"
            )
            session.add(conv)
            await session.commit()
            await session.refresh(conv)

            m1 = ConversationMessage(
                conversation_id=conv.id,
                sender_type="user",
                sender_id=owner.id,
                content="Alex, initialize our digital marketing and software development workforce. I want full readiness across all 5 divisions."
            )
            session.add(m1)

            m2 = ConversationMessage(
                conversation_id=conv.id,
                sender_type="agent",
                sender_id="agent_ceo",
                content="""Welcome, Founder. IBS AI Workforce is at 100% operational readiness.

### Operational Status:
- **30 Specialized AI Agents**: Activated across Executive, Technology, Digital Marketing, Creative Studio, and Sales divisions.
- **Isolated Software Workspaces**: Configured with strict boundary controls for sandboxed code generation.
- **Safety & Approval Gates**: Active. All outbound ad spend and external email sequences will be held in the Approval Center for your review.
- **Active Projects**: E-commerce, healthcare SaaS, and fintech lead generation pipelines initialized.

Type any objective into this Command Center, and I will synthesize the task DAG, assign specialists, coordinate dependencies, and deliver verified agency deliverables."""
            )
            session.add(m2)
            await session.commit()

    print("Agency operational seeding complete: Real clients, projects, tasks, deliverables, approvals, and conversation history loaded!")

if __name__ == "__main__":
    asyncio.run(seed_full_agency_ecosystem())
