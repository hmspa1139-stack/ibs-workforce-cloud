from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.task import Task, TaskDependency, AgentRun, AgentRunEvent
from app.models.project import Project
from app.models.agent import AgentProfile
from app.schemas.project import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Task Management"])

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    project_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lists all tasks across projects or filtered for the Kanban board."""
    query = select(Task).where(Task.is_deleted == False)
    if project_id:
        query = query.where(Task.project_id == project_id)
    if agent_id:
        query = query.where(Task.assigned_agent_id == agent_id)
    if status_filter:
        query = query.where(Task.status == status_filter)
    if priority_filter:
        query = query.where(Task.priority == priority_filter)

    query = query.order_by(desc(Task.created_at))
    tasks = (await db.execute(query)).scalars().all()

    results = []
    for t in tasks:
        # Agent details
        a_res = await db.execute(select(AgentProfile).where(AgentProfile.agent_id == t.assigned_agent_id))
        agent = a_res.scalar_one_or_none()

        # Project name
        p_res = await db.execute(select(Project).where(Project.id == t.project_id))
        proj = p_res.scalar_one_or_none()

        # Dependencies
        dep_res = await db.execute(select(TaskDependency.depends_on_task_id).where(TaskDependency.task_id == t.id))
        deps = [row[0] for row in dep_res.all()]

        results.append(TaskResponse(
            id=t.id,
            project_id=t.project_id,
            project_name=proj.name if proj else None,
            parent_task_id=t.parent_task_id,
            assigned_agent_id=t.assigned_agent_id,
            assigned_agent_name=agent.name if agent else None,
            assigned_agent_icon=agent.icon if agent else "Bot",
            assigned_agent_color=agent.color if agent else "#0066FF",
            title=t.title,
            description=t.description,
            status=t.status,
            priority=t.priority,
            expected_output=t.expected_output,
            actual_output=t.actual_output,
            error_message=t.error_message,
            retry_count=t.retry_count,
            execution_cost_usd=t.execution_cost_usd,
            tokens_used=t.tokens_used,
            duration_seconds=t.duration_seconds,
            started_at=t.started_at,
            completed_at=t.completed_at,
            created_at=t.created_at,
            dependencies=deps
        ))
    return results

@router.post("", response_model=TaskResponse)
async def create_task(
    req: TaskCreate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Manually creates a new task within a project."""
    p_res = await db.execute(select(Project).where(Project.id == req.project_id))
    proj = p_res.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")

    a_res = await db.execute(select(AgentProfile).where(AgentProfile.agent_id == req.assigned_agent_id))
    agent = a_res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{req.assigned_agent_id}' does not exist.")

    task = Task(
        project_id=req.project_id,
        assigned_agent_id=req.assigned_agent_id,
        title=req.title.strip(),
        description=req.description,
        status="backlog",
        priority=req.priority,
        expected_output=req.expected_output
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    if req.depends_on:
        for dep_id in req.depends_on:
            dep_entry = TaskDependency(
                task_id=task.id,
                depends_on_task_id=dep_id,
                dependency_type="finish_to_start"
            )
            db.add(dep_entry)
        await db.commit()

    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        project_name=proj.name,
        assigned_agent_id=task.assigned_agent_id,
        assigned_agent_name=agent.name,
        assigned_agent_icon=agent.icon,
        assigned_agent_color=agent.color,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        expected_output=task.expected_output,
        retry_count=0,
        execution_cost_usd=0.0,
        tokens_used=0,
        duration_seconds=0.0,
        created_at=task.created_at,
        dependencies=req.depends_on or []
    )

@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    req: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    """Updates task status, priority, or assignment."""
    res = await db.execute(select(Task).where(Task.id == task_id))
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if req.title is not None:
        task.title = req.title.strip()
    if req.description is not None:
        task.description = req.description
    if req.assigned_agent_id is not None:
        task.assigned_agent_id = req.assigned_agent_id
    if req.priority is not None:
        task.priority = req.priority
    if req.status is not None:
        task.status = req.status
        if req.status == "completed" and not task.completed_at:
            task.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(task)

    # Agent & Project info
    a_res = await db.execute(select(AgentProfile).where(AgentProfile.agent_id == task.assigned_agent_id))
    agent = a_res.scalar_one_or_none()
    p_res = await db.execute(select(Project).where(Project.id == task.project_id))
    proj = p_res.scalar_one_or_none()

    return TaskResponse(
        id=task.id,
        project_id=task.project_id,
        project_name=proj.name if proj else None,
        assigned_agent_id=task.assigned_agent_id,
        assigned_agent_name=agent.name if agent else None,
        assigned_agent_icon=agent.icon if agent else "Bot",
        assigned_agent_color=agent.color if agent else "#0066FF",
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        expected_output=task.expected_output,
        actual_output=task.actual_output,
        error_message=task.error_message,
        retry_count=task.retry_count,
        execution_cost_usd=task.execution_cost_usd,
        tokens_used=task.tokens_used,
        duration_seconds=task.duration_seconds,
        started_at=task.started_at,
        completed_at=task.completed_at,
        created_at=task.created_at,
        dependencies=[]
    )
