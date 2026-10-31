import asyncio
import json
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import engine, AsyncSessionLocal, Base
from app.models import (
    Workspace, Department, AgentProfile, AgentInstruction, 
    Integration, SystemSetting
)
from app.database.seed_data import DEPARTMENTS_DATA, AGENTS_DATA

DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"

INTEGRATION_TEMPLATES = [
    {"key": "gemini", "name": "Google Gemini API", "desc": "Official Google Gemini 2.5 Flash / Pro model runner for AI workforce."},
    {"key": "openai", "name": "OpenAI Platform", "desc": "Official OpenAI Agents SDK and GPT-4o model integration."},
    {"key": "github", "name": "GitHub Repositories", "desc": "Code versioning, branch management, and pull request generation."},
    {"key": "gdrive", "name": "Google Drive", "desc": "Project documentation sync, deliverables archive, and folder organization."},
    {"key": "gmail", "name": "Google Workspace Gmail", "desc": "Client follow-ups and outreach email drafting (requires human approval to send)."},
    {"key": "meta_ads", "name": "Meta Marketing API", "desc": "Facebook & Instagram campaign management (strictly gated for human approval)."},
    {"key": "google_ads", "name": "Google Ads API", "desc": "Google Search, Display & Performance Max management (strictly gated)."},
    {"key": "web_research", "name": "Web Research Engine", "desc": "Public internet search, competitor intelligence, and source citation engine."},
    {"key": "playwright", "name": "Browser Automation (Playwright)", "desc": "Automated end-to-end web testing, UI verification, and screenshot auditing."},
    {"key": "image_generation", "name": "Image Generation Provider", "desc": "AI visual generation for marketing banners, ad creatives, and logos."},
    {"key": "hosting", "name": "Cloud Deployment Adapter", "desc": "Vercel, Render & VPS hosting preview and production deployments."}
]

async def init_database():
    """Initializes tables and seeds default records idempotently."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        # 1. Initialize Default Workspace
        ws_res = await session.execute(select(Workspace).where(Workspace.id == DEFAULT_WORKSPACE_ID))
        ws = ws_res.scalar_one_or_none()
        if not ws:
            ws = Workspace(
                id=DEFAULT_WORKSPACE_ID,
                name="IBS Digital Headquarters",
                slug="ibs-digital",
                owner_id="pending_owner_setup",
                plan="enterprise",
                settings_json=json.dumps({
                    "timezone": "Asia/Karachi",
                    "currency": "USD",
                    "daily_budget_limit_usd": 100.0,
                    "monthly_budget_limit_usd": 2000.0
                })
            )
            session.add(ws)
            await session.commit()

        # 2. Initialize 5 Departments
        dept_id_map = {}
        for dept_dict in DEPARTMENTS_DATA:
            res = await session.execute(select(Department).where(Department.code == dept_dict["code"]))
            dept = res.scalar_one_or_none()
            if not dept:
                dept = Department(
                    code=dept_dict["code"],
                    name=dept_dict["name"],
                    description=dept_dict["description"],
                    icon=dept_dict["icon"],
                    color=dept_dict["color"],
                    display_order=dept_dict["display_order"],
                    head_agent_id=dept_dict["head_agent_id"]
                )
                session.add(dept)
                await session.flush()
            dept_id_map[dept_dict["code"]] = dept.id
        await session.commit()

        # 3. Initialize 30 Specialized Agents
        for agent_dict in AGENTS_DATA:
            res = await session.execute(select(AgentProfile).where(AgentProfile.agent_id == agent_dict["agent_id"]))
            profile = res.scalar_one_or_none()
            dept_id = dept_id_map.get(agent_dict["department_code"], "")

            if not profile:
                profile = AgentProfile(
                    agent_id=agent_dict["agent_id"],
                    department_id=dept_id,
                    name=agent_dict["name"],
                    designation=agent_dict["designation"],
                    icon=agent_dict["icon"],
                    color=agent_dict["color"],
                    mission=agent_dict["mission"],
                    specialization=agent_dict["specialization"],
                    status="idle",
                    is_enabled=True,
                    accepted_inputs=json.dumps(agent_dict["accepted_inputs"]),
                    expected_outputs=json.dumps(agent_dict["expected_outputs"]),
                    tool_permissions=json.dumps(agent_dict["tool_permissions"]),
                    quality_checklist=json.dumps(agent_dict["quality_checklist"]),
                    execution_limits=json.dumps(agent_dict["execution_limits"])
                )
                session.add(profile)
                await session.flush()

                # Add active instruction
                instruction = AgentInstruction(
                    agent_id=agent_dict["agent_id"],
                    version=1,
                    system_prompt=agent_dict["system_prompt"].strip(),
                    is_active=True
                )
                session.add(instruction)
            else:
                # Update metadata if needed
                profile.department_id = dept_id
                profile.name = agent_dict["name"]
                profile.designation = agent_dict["designation"]
                profile.mission = agent_dict["mission"]
                profile.specialization = agent_dict["specialization"]
                profile.accepted_inputs = json.dumps(agent_dict["accepted_inputs"])
                profile.expected_outputs = json.dumps(agent_dict["expected_outputs"])
                profile.tool_permissions = json.dumps(agent_dict["tool_permissions"])
                profile.quality_checklist = json.dumps(agent_dict["quality_checklist"])
                profile.execution_limits = json.dumps(agent_dict["execution_limits"])
        await session.commit()

        # 4. Initialize Integrations
        for itmpl in INTEGRATION_TEMPLATES:
            ires = await session.execute(
                select(Integration).where(
                    Integration.workspace_id == DEFAULT_WORKSPACE_ID,
                    Integration.provider_key == itmpl["key"]
                )
            )
            integ = ires.scalar_one_or_none()
            if not integ:
                integ = Integration(
                    workspace_id=DEFAULT_WORKSPACE_ID,
                    provider_key=itmpl["key"],
                    provider_name=itmpl["name"],
                    description=itmpl["desc"],
                    is_enabled=(itmpl["key"] in ["gemini", "web_research"]),
                    is_connected=False,
                    status_message="Not Connected — Configure API credentials",
                    config_json=json.dumps({"provider": itmpl["key"]})
                )
                session.add(integ)
        await session.commit()

        # 5. Initialize Default System Settings
        settings_defaults = [
            ("app_name", "IBS AI Workforce"),
            ("company_name", "IBS Digital"),
            ("tagline", "One Company. Thirty AI Specialists. Unlimited Possibilities."),
            ("display_timezone", "Asia/Karachi"),
            ("default_ai_provider", "gemini"),
            ("default_model", "gemini-2.5-flash"),
            ("cost_limit_per_task", "5.00"),
            ("require_approval_ad_spend", "true"),
            ("require_approval_email", "true"),
            ("require_approval_deploy", "true")
        ]
        for key, val in settings_defaults:
            s_res = await session.execute(
                select(SystemSetting).where(
                    SystemSetting.workspace_id == DEFAULT_WORKSPACE_ID,
                    SystemSetting.setting_key == key
                )
            )
            setting_row = s_res.scalar_one_or_none()
            if not setting_row:
                setting_row = SystemSetting(
                    workspace_id=DEFAULT_WORKSPACE_ID,
                    setting_key=key,
                    setting_value=val
                )
                session.add(setting_row)
        await session.commit()

if __name__ == "__main__":
    asyncio.run(init_database())
    print("Database initialization and seed complete: 5 Departments, 30 Agents, 11 Integrations, System Settings.")
