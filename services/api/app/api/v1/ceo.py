import json
import asyncio
import re
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db, AsyncSessionLocal
from app.core.security import get_current_user
from app.models.conversation import Conversation, ConversationMessage
from app.models.project import Project
from app.models.task import AgentRunEvent
from app.models.workspace import Workspace
from app.schemas.ceo import CEOChatRequest, CEOChatResponse, TaskPlanSchema
from app.services.orchestration_service import OrchestrationEngine
from app.services.file_workspace import WorkspaceFileSystem

router = APIRouter(prefix="/ceo", tags=["AI CEO Command Center"])

@router.post("/chat", response_model=CEOChatResponse)
async def chat_with_ceo(
    req: CEOChatRequest,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Founder command center: AI CEO plans and coordinates multi-agent agency execution."""
    ws_res = await db.execute(select(Workspace).limit(1))
    ws = ws_res.scalar_one_or_none()
    ws_id = ws.id if ws else "default_workspace"

    # 1. Retrieve or Create Active CEO Conversation
    conv_res = await db.execute(
        select(Conversation).where(
            Conversation.workspace_id == ws_id,
            Conversation.channel == "ceo_chat"
        ).order_by(desc(Conversation.created_at)).limit(1)
    )
    conversation = conv_res.scalar_one_or_none()
    if not conversation:
        conversation = Conversation(
            workspace_id=ws_id,
            user_id=user.id,
            title="AI CEO Strategic Session",
            channel="ceo_chat"
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    # 2. Record User Message
    user_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type="user",
        sender_id=user.id,
        content=req.message
    )
    db.add(user_msg)
    await db.commit()

    # 3. AI CEO Synthesizes Multi-Agent DAG Plan
    plan: TaskPlanSchema = await OrchestrationEngine.create_plan(req.message)

    # 4. Check If We Should Execute Immediately
    execution_started = False
    project_id = req.project_id
    tasks_count = 0

    if not req.plan_only:
        # Create Project If Not Specified
        if not project_id:
            slug = re.sub(r"[^a-zA-Z0-9_-]", "-", plan.project_name.lower()).strip("-")[:45] + f"-{int(datetime.now().timestamp()) % 1000}"
            proj = Project(
                workspace_id=ws_id,
                name=plan.project_name,
                slug=slug,
                description=plan.objective,
                status="active",
                priority="high",
                budget_limit_usd=req.cost_limit_usd or 5.0
            )
            db.add(proj)
            await db.commit()
            await db.refresh(proj)
            project_id = proj.id

            fs = WorkspaceFileSystem(project_id)
            proj.workspace_path = fs.root_path
            fs.write_file("README.md", f"# {proj.name}\n\n**Objective:** {proj.description}\n\n**Strategy:** {plan.executive_summary}\n")
            await db.commit()

        # Run DAG Plan
        exec_res = await OrchestrationEngine.execute_dag_plan(db, project_id, plan, ws_id)
        execution_started = True
        tasks_count = exec_res.get("tasks_executed", len(plan.tasks))

    # 5. Formulate AI CEO Executive Response
    if execution_started:
        ceo_reply = f"""Understood, Founder. I have initiated the **{plan.project_name}** project and mobilized {len(plan.tasks)} specialists across our divisions.

### Strategic Summary:
{plan.executive_summary}

### Specialist Allocations & Workflow:
"""
        for t in plan.tasks:
            ceo_reply += f"- **{t.title}** assigned to `{t.agent_id}` (Dependencies: {', '.join(t.dependencies) if t.dependencies else 'None'})\n"

        ceo_reply += f"\nAll deliverables have been compiled, verified through QA, and archived into the isolated project workspace `{project_id}`. You can review task progress on the Kanban board or inspect generated deliverables in Files."
    else:
        ceo_reply = f"""I have synthesized the strategic execution plan for **{plan.project_name}**:

{plan.executive_summary}

Review the planned tasks and dependencies below. Toggle 'Start Execution' whenever you are ready to mobilize the specialists."""

    # 6. Save CEO Message
    ceo_msg = ConversationMessage(
        conversation_id=conversation.id,
        sender_type="agent",
        sender_id="agent_ceo",
        content=ceo_reply,
        message_metadata=json.dumps({"plan": plan.model_dump(), "project_id": project_id})
    )
    db.add(ceo_msg)
    await db.commit()

    return CEOChatResponse(
        conversation_id=conversation.id,
        reply=ceo_reply,
        plan=plan,
        project_id=project_id,
        execution_started=execution_started,
        tasks_created=tasks_count
    )

@router.get("/history")
async def get_chat_history(limit: int = 30, db: AsyncSession = Depends(get_db)):
    """Retrieves persistent conversation history for the AI CEO chat."""
    conv_res = await db.execute(
        select(Conversation).where(Conversation.channel == "ceo_chat").order_by(desc(Conversation.created_at)).limit(1)
    )
    conversation = conv_res.scalar_one_or_none()
    if not conversation:
        return []

    msg_res = await db.execute(
        select(ConversationMessage).where(
            ConversationMessage.conversation_id == conversation.id
        ).order_by(ConversationMessage.created_at).limit(limit)
    )
    messages = msg_res.scalars().all()

    return [
        {
            "id": m.id,
            "sender_type": m.sender_type,
            "sender_id": m.sender_id,
            "content": m.content,
            "created_at": m.created_at,
            "metadata": json.loads(m.message_metadata or "{}")
        }
        for m in messages
    ]

@router.get("/events")
async def stream_live_activity():
    """Server-Sent Events (SSE) stream broadcasting live agent task execution events."""
    async def event_generator():
        last_check = datetime.now(timezone.utc)
        while True:
            await asyncio.sleep(2.0)
            async with AsyncSessionLocal() as session:
                res = await session.execute(
                    select(AgentRunEvent).where(
                        AgentRunEvent.created_at > last_check
                    ).order_by(AgentRunEvent.created_at)
                )
                events = res.scalars().all()
                if events:
                    last_check = datetime.now(timezone.utc)
                    for ev in events:
                        payload = {
                            "id": ev.id,
                            "type": ev.event_type,
                            "message": ev.message,
                            "payload": json.loads(ev.payload_json or "{}"),
                            "created_at": ev.created_at.isoformat()
                        }
                        yield f"data: {json.dumps(payload)}\n\n"
                else:
                    # Keep-alive heartbeat
                    yield f": ping\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
