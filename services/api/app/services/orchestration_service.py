import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import AsyncSessionLocal
from app.models.project import Project
from app.models.task import Task, TaskDependency
from app.models.agent import AgentProfile
from app.models.conversation import Conversation, ConversationMessage
from app.schemas.ceo import TaskPlanSchema, TaskItemPlan
from app.services.agent_runner import AgentExecutionEngine
from app.services.memory_service import MemoryService
from app.integrations.gemini_provider import GeminiProviderAdapter
from app.core.config import settings

logger = logging.getLogger("ibs.orchestrator")
gemini_adapter = GeminiProviderAdapter()

class OrchestrationEngine:
    @staticmethod
    async def create_plan(user_instruction: str) -> TaskPlanSchema:
        """AI CEO analyzes user request and synthesizes a structured execution DAG plan."""
        if settings.GEMINI_API_KEY:
            prompt = f"""You are the AI CEO of IBS Digital (IBS AI Workforce).
Analyze this client/founder request and generate a structured task execution plan using relevant specialists among the 30 available IBS AI agents:
Request: "{user_instruction}"

Respond ONLY with valid JSON in this exact structure:
{{
  "project_name": "Concise Project Name",
  "objective": "Clear executive objective",
  "executive_summary": "High level strategy overview",
  "estimated_cost_usd": 0.45,
  "estimated_duration_minutes": 5,
  "tasks": [
    {{
      "task_id": "task_1",
      "agent_id": "agent_business_analyst",
      "title": "Prepare Requirements Document",
      "description": "Scope out core user stories and business logic",
      "dependencies": [],
      "priority": "high",
      "expected_output": "Requirements Specification"
    }},
    {{
      "task_id": "task_2",
      "agent_id": "agent_uiux_designer",
      "title": "Design UI/UX Blueprint",
      "description": "Formulate design tokens, component hierarchy, and layout specs",
      "dependencies": ["task_1"],
      "priority": "high",
      "expected_output": "Design Specifications"
    }}
  ]
}}
Ensure agent_id matches valid IBS agents. Dependencies must be strictly acyclic."""

            res = await gemini_adapter.generate_content(
                system_instruction="You are the AI CEO. Return strictly valid JSON.",
                user_prompt=prompt,
                response_schema={"type": "object"}
            )
            if res.get("success") and res.get("text"):
                try:
                    clean_text = res["text"].strip()
                    if clean_text.startswith("```json"):
                        clean_text = clean_text[7:]
                    if clean_text.endswith("```"):
                        clean_text = clean_text[:-3]
                    data = json.loads(clean_text)
                    return TaskPlanSchema(**data)
                except Exception as e:
                    logger.warning(f"Failed to parse LLM JSON plan: {e}. Falling back to dynamic planner.")

        # Heuristic intent-based plan generator
        return OrchestrationEngine._heuristic_plan_generator(user_instruction)

    @staticmethod
    def _heuristic_plan_generator(user_instruction: str) -> TaskPlanSchema:
        lower = user_instruction.lower()

        if any(w in lower for w in ["ecommerce", "e-commerce", "store", "shop"]):
            project_name = "E-Commerce Digital Platform"
            summary = "Turnkey e-commerce storefront with product management, payment checkout, SEO optimization, and ad strategy."
            tasks = [
                TaskItemPlan(
                    task_id="task_1",
                    agent_id="agent_business_analyst",
                    title="E-Commerce Architecture & Functional Requirements",
                    description="Define catalog structure, checkout flows, and payment gateway specifications.",
                    dependencies=[],
                    priority="high",
                    expected_output="FRD & Checkout Architecture Document"
                ),
                TaskItemPlan(
                    task_id="task_2",
                    agent_id="agent_uiux_designer",
                    title="Storefront & Dashboard Design Specifications",
                    description="Create modern storefront UI layouts and admin product management specs.",
                    dependencies=["task_1"],
                    priority="high",
                    expected_output="Tailwind Design System & Wireframes"
                ),
                TaskItemPlan(
                    task_id="task_3",
                    agent_id="agent_seo_specialist",
                    title="E-Commerce Search Engine Optimization Matrix",
                    description="Research commercial intent keywords, write product metadata, and JSON-LD schema.",
                    dependencies=["task_1"],
                    priority="medium",
                    expected_output="SEO Keyword & Schema Spec"
                ),
                TaskItemPlan(
                    task_id="task_4",
                    agent_id="agent_fullstack_developer",
                    title="Implement Storefront & Cart Application",
                    description="Build responsive Next.js storefront with cart state and API integration.",
                    dependencies=["task_1", "task_2"],
                    priority="high",
                    expected_output="Production Web Storefront Source Code"
                ),
                TaskItemPlan(
                    task_id="task_5",
                    agent_id="agent_meta_ads",
                    title="Meta Ad Campaign & Creative Brief",
                    description="Formulate Facebook/Instagram conversion ad sets and direct-response copy.",
                    dependencies=["task_1"],
                    priority="medium",
                    expected_output="Meta Campaign Architecture & Ad Copy"
                ),
                TaskItemPlan(
                    task_id="task_6",
                    agent_id="agent_qa_engineer",
                    title="End-to-End Quality & Regression Verification",
                    description="Execute functional test validation on storefront code and links.",
                    dependencies=["task_4"],
                    priority="urgent",
                    expected_output="QA Verification Audit Certificate"
                )
            ]
        elif any(w in lower for w in ["marketing", "campaign", "ads", "seo", "brand"]):
            project_name = "Omnichannel Growth & Marketing Campaign"
            summary = "Targeted digital marketing campaign combining market research, SEO, ad copy, and analytics."
            tasks = [
                TaskItemPlan(
                    task_id="task_1",
                    agent_id="agent_strategy_research",
                    title="Market & Competitor Intelligence Teardown",
                    description="Audit top 5 competitors, benchmark customer acquisition channels, and define USP.",
                    dependencies=[],
                    priority="high",
                    expected_output="Market Intelligence Whitepaper"
                ),
                TaskItemPlan(
                    task_id="task_2",
                    agent_id="agent_content_copywriter",
                    title="High-Converting Sales Copy & Funnel Messaging",
                    description="Draft landing page value proposition, email drip sequences, and ad headlines.",
                    dependencies=["task_1"],
                    priority="high",
                    expected_output="Conversion Copywriting Deck"
                ),
                TaskItemPlan(
                    task_id="task_3",
                    agent_id="agent_seo_specialist",
                    title="Organic Search Ranking & Content Strategy",
                    description="Map high-intent search queries and technical on-page recommendations.",
                    dependencies=["task_1"],
                    priority="medium",
                    expected_output="SEO Keyword Matrix"
                ),
                TaskItemPlan(
                    task_id="task_4",
                    agent_id="agent_qa_engineer",
                    title="Deliverable Quality & Brand Compliance Audit",
                    description="Verify messaging alignment, grammar, links, and regulatory compliance.",
                    dependencies=["task_2", "task_3"],
                    priority="high",
                    expected_output="QA Marketing Certification"
                )
            ]
        else:
            project_name = "Enterprise Software & Digital Initiative"
            summary = "Cross-functional execution plan coordinated by the AI CEO."
            tasks = [
                TaskItemPlan(
                    task_id="task_1",
                    agent_id="agent_product_manager",
                    title="Requirements Scope & Specifications",
                    description="Specify requirements and user stories.",
                    dependencies=[],
                    priority="high",
                    expected_output="Product Specification Document"
                ),
                TaskItemPlan(
                    task_id="task_2",
                    agent_id="agent_fullstack_developer",
                    title="Application Development & Implementation",
                    description="Develop the core application deliverables.",
                    dependencies=["task_1"],
                    priority="high",
                    expected_output="Technical Deliverable Package"
                ),
                TaskItemPlan(
                    task_id="task_3",
                    agent_id="agent_qa_engineer",
                    title="Quality Review & Verification",
                    description="Ensure deliverable meets enterprise criteria.",
                    dependencies=["task_2"],
                    priority="high",
                    expected_output="QA Audit Certificate"
                )
            ]

        return TaskPlanSchema(
            project_name=project_name,
            objective=user_instruction,
            executive_summary=summary,
            tasks=tasks,
            estimated_cost_usd=0.45,
            estimated_duration_minutes=len(tasks) * 2
        )

    @staticmethod
    async def execute_dag_plan(
        session: AsyncSession,
        project_id: str,
        plan: TaskPlanSchema,
        workspace_id: str
    ) -> Dict[str, Any]:
        """Creates database records for tasks and executes DAG with isolated task sessions."""
        res = await session.execute(select(Project).where(Project.id == project_id))
        project = res.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project '{project_id}' not found.")

        project.status = "active"
        await session.commit()

        # 1. Map and Create Tasks in DB
        task_id_map: Dict[str, Task] = {}
        plan_task_map: Dict[str, TaskItemPlan] = {}

        for t_item in plan.tasks:
            db_task = Task(
                project_id=project.id,
                assigned_agent_id=t_item.agent_id,
                title=t_item.title,
                description=t_item.description,
                status="backlog",
                priority=t_item.priority,
                expected_output=t_item.expected_output,
                max_retries=3
            )
            session.add(db_task)
            await session.flush()
            task_id_map[t_item.task_id] = db_task
            plan_task_map[t_item.task_id] = t_item

        # 2. Record Task Dependencies
        for t_item in plan.tasks:
            current_db_task = task_id_map[t_item.task_id]
            for dep_id in t_item.dependencies:
                if dep_id in task_id_map:
                    prereq_task = task_id_map[dep_id]
                    dep_row = TaskDependency(
                        task_id=current_db_task.id,
                        depends_on_task_id=prereq_task.id,
                        dependency_type="finish_to_start"
                    )
                    session.add(dep_row)
        await session.commit()

        # 3. Topological Execution Loop
        completed_task_ids = set()
        outputs_cache: Dict[str, str] = {}
        all_plan_ids = [t.task_id for t in plan.tasks]

        while len(completed_task_ids) < len(all_plan_ids):
            ready_tasks = []
            for t_id in all_plan_ids:
                if t_id not in completed_task_ids:
                    plan_item = plan_task_map[t_id]
                    deps_satisfied = all(dep in completed_task_ids for dep in plan_item.dependencies)
                    if deps_satisfied:
                        ready_tasks.append(t_id)

            if not ready_tasks:
                logger.info("No further ready tasks (or all remaining tasks completed).")
                break

            # Execute independent ready tasks concurrently with dedicated sessions
            async def run_single(tid: str):
                plan_item = plan_task_map[tid]
                task_db_id = task_id_map[tid].id
                prev_outs = [
                    {"agent": plan_task_map[dep].agent_id, "output": outputs_cache.get(dep, "")}
                    for dep in plan_item.dependencies
                ]
                async with AsyncSessionLocal() as task_session:
                    t_res = await task_session.execute(select(Task).where(Task.id == task_db_id))
                    fresh_task = t_res.scalar_one()
                    p_res = await task_session.execute(select(Project).where(Project.id == project_id))
                    fresh_project = p_res.scalar_one()

                    scoped_mem = await MemoryService.get_scoped_context(task_session, workspace_id, project_id)
                    res = await AgentExecutionEngine.execute_task(task_session, fresh_task, fresh_project, scoped_mem, prev_outs)
                    return tid, res

            results = await asyncio.gather(*[run_single(tid) for tid in ready_tasks], return_exceptions=True)

            for item in results:
                if isinstance(item, Exception):
                    logger.error(f"Task execution error: {item}")
                    continue
                tid, res = item
                completed_task_ids.add(tid)
                outputs_cache[tid] = res.get("output", "")

        # 4. Final Executive Delivery Status
        async with AsyncSessionLocal() as final_session:
            fp_res = await final_session.execute(select(Project).where(Project.id == project_id))
            fresh_p = fp_res.scalar_one()
            fresh_p.status = "completed"
            
            # Sum up actual task costs
            all_tasks_res = await final_session.execute(select(Task).where(Task.project_id == project_id))
            all_t = all_tasks_res.scalars().all()
            fresh_p.total_spend_usd = round(sum([t.execution_cost_usd for t in all_t]), 4)
            await final_session.commit()

        return {
            "status": "completed",
            "project_id": project.id,
            "tasks_executed": len(completed_task_ids)
        }
